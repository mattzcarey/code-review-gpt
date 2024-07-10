from pathlib import Path
from tree_sitter import Language, Parser
import os
import difflib
import tree_sitter_python as tspython
from collections import defaultdict

PY_LANGUAGE = Language(tspython.language())

def get_parser():
    parser = Parser(PY_LANGUAGE)
    return parser

class DependencyNode:
    def __init__(self, file_path):
        self.file_path = file_path
        self.functions = {}  # key: function name, value: set of called functions
        self.imports = defaultdict(set)  # key: imported module, value: set of imported functions
        self.function_body = {}  # key: function name, value: function content
        
    def __repr__(self):
        return f"DependencyNode(file='{self.file_path}')"

def analyze_file(file_path):
    parser = get_parser()
    with open(file_path, 'r') as f:
        content = f.read()
    tree = parser.parse(bytes(content, 'utf8'))

    query = PY_LANGUAGE.query("""
        (import_from_statement
          module_name: (_) @module_name
          name: (dotted_name) @function_name)
        (function_definition
          name: (identifier) @function_def
          body: (block) @function_body)
        (call
          function: (identifier) @function_call)
    """)

    node = DependencyNode(file_path)
    captures = query.captures(tree.root_node)
    
    current_function = None
    for capture in captures:
        capture_node, capture_type = capture
        text = capture_node.text.decode('utf8')
        
        if capture_type == 'module_name':
            current_module = text
        elif capture_type == 'function_name':
            node.imports[current_module].add(text)
        elif capture_type == 'function_def':
            current_function = text
            node.functions[current_function] = set()
        elif capture_type == 'function_body':
            node.function_body[current_function] = (capture_node.start_byte, capture_node.end_byte)
        elif capture_type == 'function_call':
            if current_function:
                node.functions[current_function].add(text)
            else:
                if 'top_level' not in node.functions:
                    node.functions['top_level'] = set()
                node.functions['top_level'].add(text)

    # Add top-level content
    node.function_body['top_level'] = content

    return node

def build_dependency_graph(directory):
    graph = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                graph[file_path] = analyze_file(file_path)
    return graph

def find_dependants(graph, target_file, target_function, visited=None):
    if visited is None:
        visited = set()

    dependants = {}
    target_module = os.path.splitext(os.path.basename(target_file))[0]

    for file_path, node in graph.items():
        if file_path == target_file or file_path in visited:
            continue
        
        visited.add(file_path)
        
        uses_function = False
        using_function = None
        for module, funcs in node.imports.items():
            if target_function in funcs and module == '.' + target_module:
                for func, calls in node.functions.items():
                    if target_function in calls:
                        uses_function = True
                        using_function = func
                        break
                if 'top_level' in node.functions and target_function in node.functions['top_level']:
                    uses_function = True
                    using_function = 'top_level'
                break

        def get_function_body(node, function_name):
            if function_name == 'top_level':
                return node.function_body['top_level']
            else:
                start_byte, end_byte = node.function_body.get(function_name, (0, 0))
                return node.function_body['top_level'][start_byte:end_byte]

        if uses_function:
            dependants[file_path] = {
                'function_name': using_function,
                'function_body': get_function_body(node, using_function),
                'dependants': find_dependants(graph, file_path, using_function if using_function != 'top_level' else None, visited)
            }

    return dependants

def print_dependency_graph(dependants, level=1):
    for dep_file, dep_info in dependants.items():
        print(f"{os.path.basename(dep_file)}:{dep_info['function_name']}     level: {str(level)}")
        
        if dep_info['dependants']:
            print_dependency_graph(dep_info['dependants'], level + 1)

def get_function_body(filename, function_name):
    parser = get_parser()
    with open(filename, 'r') as file:
        content = file.read()
    
    tree = parser.parse(bytes(content, 'utf8'))
    
    query = PY_LANGUAGE.query("""
        (function_definition
          name: (identifier) @function_name
          body: (block) @function_body)
    """)
    
    captures = query.captures(tree.root_node)
    
    for node, capture_name in captures:
        if capture_name == 'function_name' and node.text.decode('utf8') == function_name:
            function_node = node.parent
            return content[function_node.start_byte:function_node.end_byte]
    
    return None

def stringify_dependants(dependants, depth=0):
    result = []    
    for dep_file, dep_info in dependants.items():
        result.append("<node>")
        result.append(f"<path>{dep_file}</path>")
        result.append(f"<function_name>{dep_info['function_name']}</function_name>")
        result.append(f"<function_body>{dep_info['function_body']}</function_body>")
        
        if dep_info['dependants']:
            result.append(f"<nested_depth_{depth+1}>")
            result.append(stringify_dependants(dep_info['dependants'], depth+1))
            result.append(f"</nested_depth_{depth+1}>")
        
        result.append("</node>")
    
    return "\n".join(result)
        

def analyze_change(old_code, new_code, dependants):
    diff = list(difflib.unified_diff(old_code.splitlines(), new_code.splitlines(), lineterm=''))
    
    old_chunk = []
    new_chunk = []
    
    for line in diff[2:]:
        if line.startswith('-'):
            old_chunk.append(line[1:])
        elif line.startswith('+'):
            new_chunk.append(line[1:])
        elif line.startswith(' '):
            old_chunk.append(line[1:])
            new_chunk.append(line[1:])
    
    old_chunk_str = '\n'.join(old_chunk)
    new_chunk_str = '\n'.join(new_chunk)
    prompt = f"""
Given the following change in a Python function:

Old version:
{old_chunk_str}

New version:
{new_chunk_str}

Use the following dependency tree:
{stringify_dependants(dependants)}

Is this a breaking change? Please explain why or why not, considering the potential impact on the dependent files and functions.
"""
    print(prompt)
    
    # In a real implementation, you would send this prompt to an LLM API
    # and get the response. For this POC, we'll simulate the LLM's response.
    
    if 'return a * b' in new_code:
        return "Yes, this is a breaking change. The function has been changed to perform multiplication instead of addition. This will cause unexpected behavior in the dependent files and functions listed in the dependants."
    else:
        return "No breaking change detected. The modification doesn't appear to alter the fundamental behavior of the function in a way that would break dependent code. However, carefully review the dependants to ensure no unexpected side effects occur."

def run_test(directory, target_file, target_function):
    graph = build_dependency_graph(directory)
    dependants = find_dependants(graph, target_file, target_function)
    
    print(f"\nDependency Graph for {os.path.basename(target_file)}:{target_function}")
    print("=" * 50)
    print_dependency_graph(dependants)

    if not dependants:
        print("No dependants found.")

    old_function = get_function_body(target_file, target_function)
    new_function = """
def {0}(a, b):
    return a * b
""".format(target_function)

    result = analyze_change(old_function, new_function, dependants)
    print("\nAnalysis result:", result)

if __name__ == '__main__':
    current_file = Path(__file__).resolve()
    directory = current_file.parent / 'examples'

    file1 = os.path.join(directory, 'math.py')
    function1 = 'add'
    run_test(directory, file1, function1)

    file2 = os.path.join(directory, 'util.py')
    function2 = 'printer'
    run_test(directory, file2, function2)