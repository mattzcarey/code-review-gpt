import ast
import json
import argparse
import os
import anthropic
from typing import Dict, List, Any, Optional
from pathlib import Path
from tree_sitter import Language, Parser
import tree_sitter_python as tspython
from pydantic import BaseModel, Field
from collections import defaultdict

class FunctionInfo(BaseModel):
    summary: str = Field(default="No docstring provided")
    imported_by: List[str] = Field(default_factory=list)
    imports: Dict[str, set] = Field(default_factory=lambda: defaultdict(set))
    function_body: str = Field(default="")

class DependencyNode(BaseModel):
    file_path: str
    functions: Dict[str, FunctionInfo] = Field(default_factory=dict)

class CodebaseMapping(BaseModel):
    mapping: Dict[str, DependencyNode] = Field(default_factory=dict)
    file_aliases: Dict[str, str] = Field(default_factory=dict)

    def build_mapping(self, root_path: str) -> None:
        """
        Build a mapping of the whole codebase.
        
        :param root_path: The root directory of the codebase
        """
        for root, _, files in os.walk(root_path):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    self.file_aliases[file_path] = str(len(self.file_aliases) + 1)
                    self._parse_file(file_path)

    def _parse_file(self, file_path: str) -> None:
        """
        Parse a Python file and extract function information.
        
        :param file_path: The path of the file to parse
        """
        with open(file_path, 'r') as file:
            try:
                tree = ast.parse(file.read())
            except SyntaxError:
                print(f"Error parsing file: {file_path}")
                return

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_name = node.name
                alias = self.file_aliases[file_path]
                key = f"{function_name}@{alias}"
                
                self.mapping[key] = {
                    "summary": ast.get_docstring(node) or "No docstring provided",
                    "imported_by": [],
                    "imports": self._get_imports(node),
                    "file_alias": alias
                }

    def _get_imports(self, node: ast.AST) -> List[str]:
        """
        Get the list of imports used in a function.
        
        :param node: The AST node of the function
        :return: A list of imported function keys
        """
        imports = []
        for child in ast.walk(node):
            if isinstance(child, ast.Name) and isinstance(child.ctx, ast.Load):
                for alias, key in self.file_aliases.items():
                    if child.id in self.mapping and self.mapping[child.id]["file_alias"] == key:
                        imports.append(f"{child.id}@{key}")
                        self.mapping[f"{child.id}@{key}"]["imported_by"].append(f"{node.name}@{self.file_aliases[alias]}")
        return imports

    def update_mapping(self, diff: str) -> None:
        """
        Update the mapping based on a diff.
        
        :param diff: The diff string representing changes
        """
        patch_set = PatchSet(diff)
        
        for patched_file in patch_set:
            file_path = patched_file.path
            if file_path not in self.mapping.file_aliases:
                self.mapping.file_aliases[file_path] = str(len(self.mapping.file_aliases) + 1)
            
            alias = self.mapping.file_aliases[file_path]
            
            # Handle removed functions
            for hunk in patched_file:
                for line in hunk.source_lines():
                    if line.startswith('def '):
                        function_name = line.split('def ')[1].split('(')[0].strip()
                        if file_path in self.mapping.mapping:
                            if function_name in self.mapping.mapping[file_path].functions:
                                del self.mapping.mapping[file_path].functions[function_name]
        
            # Handle added or modified functions
            updated_content = self._apply_patch_to_file(file_path, patched_file)
            self._parse_file_content(file_path, updated_content)

    def _apply_patch_to_file(self, file_path: str, patched_file) -> str:
        """
        Apply a patch to a file and return the updated content.
        
        :param file_path: The path of the file to update
        :param patched_file: The patched file object from unidiff
        :return: The updated file content as a string
        """
        with open(file_path, 'r') as f:
            content = f.read()
        
        lines = content.splitlines()
        for hunk in patched_file:
            for line in hunk:
                if line.is_added:
                    lines.insert(hunk.target_start + line.target_line_no - 1, line.value)
                elif line.is_removed:
                    lines.pop(hunk.source_start + line.source_line_no - 1)
        
        return '\n'.join(lines)

    def _parse_file_content(self, file_path: str, content: str) -> None:
        """
        Parse file content and update the mapping.
        
        :param file_path: The path of the file
        :param content: The content of the file as a string
        """
        tree = self.parser.parse(bytes(content, 'utf8'))
        query = self.parser.language.query("""
            (import_from_statement
              module_name: (_) @module_name
              name: (dotted_name) @function_name)
            (function_definition
              name: (identifier) @function_def
              body: (block) @function_body)
            (call
              function: (identifier) @function_call)
        """)
        
        if file_path not in self.mapping.mapping:
            self.mapping.mapping[file_path] = DependencyNode(file_path=file_path)
        
        node = self.mapping.mapping[file_path]
        captures = query.captures(tree.root_node)
        
        current_function = None
        for capture in captures:
            capture_node, capture_type = capture
            text = capture_node.text.decode('utf8')
            
            if capture_type == 'module_name':
                current_module = text
            elif capture_type == 'function_name':
                if current_function and current_function in node.functions:
                    node.functions[current_function].imports[current_module].add(text)
            elif capture_type == 'function_def':
                current_function = text
                if current_function not in node.functions:
                    node.functions[current_function] = FunctionInfo()
            elif capture_type == 'function_body':
                if current_function and current_function in node.functions:
                    function_body = content[capture_node.start_byte:capture_node.end_byte]
                    node.functions[current_function].function_body = function_body
                    node.functions[current_function].summary = self.generate_summary(function_body)
        
        # Update imported_by relationships
        self._update_imported_by(file_path)

    def _update_imported_by(self, file_path: str) -> None:
        """
        Update the imported_by relationships for all functions in the file.
        
        :param file_path: The path of the file to update
        """
        node = self.mapping.mapping[file_path]
        for function_name, function_info in node.functions.items():
            for module, imported_functions in function_info.imports.items():
                for imported_function in imported_functions:
                    if module in self.mapping.mapping:
                        imported_node = self.mapping.mapping[module]
                        if imported_function in imported_node.functions:
                            imported_node.functions[imported_function].imported_by.append(f"{function_name}@{self.mapping.file_aliases[file_path]}")
    
    def _apply_patch_to_file(self, file_path: str, patched_file) -> str:
        """
        Apply a patch to a file and return the updated content.
        
        :param file_path: The path of the file to update
        :param patched_file: The patched file object from unidiff
        :return: The updated file content as a string
        """
        with open(file_path, 'r') as f:
            content = f.read()
        
        lines = content.splitlines()
        for hunk in patched_file:
            for line in hunk:
                if line.is_added:
                    lines.insert(hunk.target_start + line.target_line_no - 1, line.value)
                elif line.is_removed:
                    lines.pop(hunk.source_start + line.source_line_no - 1)
        
        return '\n'.join(lines)
    
    def _parse_file_content(self, file_path: str, content: str) -> None:
        """
        Parse file content and update the mapping.
        
        :param file_path: The path of the file
        :param content: The content of the file as a string
        """
        try:
            tree = ast.parse(content)
        except SyntaxError:
            print(f"Error parsing file: {file_path}")
            return
        
        alias = self.file_aliases[file_path]
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_name = node.name
                key = f"{function_name}@{alias}"
                
                self.mapping[key] = {
                    "summary": ast.get_docstring(node) or "No docstring provided",
                    "imported_by": [],
                    "imports": self._get_imports(node),
                    "file_alias": alias
                }

    def search_snippets(self, function_name: str, file_path: str) -> List[Dict[str, Any]]:
        """
        Search for relevant code snippets from a function name/path.
        
        :param function_name: The name of the function to search for
        :param file_path: The path of the file containing the function
        :return: A list of relevant code snippets and their context
        """
        results = []
        alias = self.file_aliases.get(file_path)
        if not alias:
            return results

        key = f"{function_name}@{alias}"
        if key in self.mapping:
            function_info = self.mapping[key]
            results.append({
                "function": function_name,
                "file": file_path,
                "summary": function_info.get("summary", ""),
                "imported_by": function_info.get("imported_by", []),
                "downstream": self._get_downstream(key, depth=5)
            })

        return results

    def _get_downstream(self, key: str, depth: int = 5) -> List[Dict[str, Any]]:
        """
        Recursively get downstream functions up to a specified depth.
        
        :param key: The function key to start from
        :param depth: The maximum depth to traverse
        :return: A list of downstream functions and their info
        """
        if depth == 0 or key not in self.mapping:
            return []

        function_info = self.mapping[key]
        downstream = []

        for imported_by in function_info.get("imported_by", []):
            downstream.append({
                "function": imported_by.split("@")[0],
                "file": self._get_file_from_alias(imported_by.split("@")[1]),
                "summary": self.mapping[imported_by].get("summary", ""),
                "downstream": self._get_downstream(imported_by, depth - 1)
            })

        return downstream

    def _get_file_from_alias(self, alias: str) -> str:
        """
        Get the file path from an alias.
        
        :param alias: The alias to look up
        :return: The corresponding file path
        """
        for file_path, file_alias in self.file_aliases.items():
            if file_alias == alias:
                return file_path
        return ""

    def save_mapping(self, output_file: str) -> None:
        """
        Save the current mapping to a JSON file.
        
        :param output_file: The path to save the mapping JSON
        """
        with open(output_file, 'w') as f:
            json.dump({
                "mapping": self.mapping,
                "file_aliases": self.file_aliases
            }, f, indent=2)

    def load_mapping(self, input_file: str) -> None:
        """
        Load a mapping from a JSON file.
        
        :param input_file: The path to load the mapping JSON from
        """
        with open(input_file, 'r') as f:
            data = json.load(f)
            self.mapping = data["mapping"]
            self.file_aliases = data["file_aliases"]

def main():
    parser = argparse.ArgumentParser(description="Codebase Mapping Tool")
    parser.add_argument("action", choices=["build", "update", "search", "save", "load"],
                        help="Action to perform")
    parser.add_argument("--root", help="Root directory for building mapping")
    parser.add_argument("--diff", help="Diff file for updating mapping")
    parser.add_argument("--function", help="Function name for searching")
    parser.add_argument("--file", help="File path for searching")
    parser.add_argument("--output", help="Output file for saving mapping")
    parser.add_argument("--input", help="Input file for loading mapping")

    args = parser.parse_args()

    codebase_mapping = CodebaseMappingTool()

    if args.action == "build":
        if not args.root:
            print("Error: --root is required for build action")
            return
        codebase_mapping.build_mapping(args.root)
        print("Codebase mapping built successfully")

    elif args.action == "update":
        if not args.diff:
            print("Error: --diff is required for update action")
            return
        with open(args.diff, 'r') as f:
            diff_content = f.read()
        codebase_mapping.update_mapping(diff_content)
        print("Codebase mapping updated successfully")

    elif args.action == "search":
        if not args.function or not args.file:
            print("Error: --function and --file are required for search action")
            return
        results = codebase_mapping.search_snippets(args.function, args.file)
        print(json.dumps(results, indent=2))

    elif args.action == "save":
        if not args.output:
            print("Error: --output is required for save action")
            return
        codebase_mapping.save_mapping(args.output)
        print(f"Codebase mapping saved to {args.output}")

    elif args.action == "load":
        if not args.input:
            print("Error: --input is required for load action")
            return
        codebase_mapping.load_mapping(args.input)
        print(f"Codebase mapping loaded from {args.input}")

if __name__ == "__main__":
    main()