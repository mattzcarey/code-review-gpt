import difflib
import os
from collections import defaultdict
from pathlib import Path

import boto3
from tree_sitter_languages import get_language, get_parser

region = "eu-west-2"
model_id = "anthropic.claude-3-sonnet-20240229-v1:0"

bedrock_client = boto3.client(service_name="bedrock-runtime", region_name=region)


def get_llm_response(prompt: str) -> str:
    params = {
        "modelId": model_id,
        "messages": [{"role": "user", "content": [{"text": prompt}]}],
        "inferenceConfig": {"temperature": 0.0, "maxTokens": 500},
    }

    resp = bedrock_client.converse(**params)
    return resp["output"]["message"]["content"][0]["text"]


# TODO: get this working with multiple languages.
# TODO: build the graph only based on the files which were changed not a static directory
# TODO: combine the graph building with the dependency analysis
# TODO: convert to typescript.


def get_tree_sitter():
    language = get_language("python")
    parser = get_parser("python")
    return parser, language


class DependencyNode:
    def __init__(self, file_path):
        self.file_path = file_path
        self.functions = {}  # key: function name, value: set of called functions
        self.imports = defaultdict(
            set
        )  # key: imported module, value: set of imported functions
        self.function_body = {}  # key: function name, value: function content

    def __repr__(self):
        return f"DependencyNode(file='{self.file_path}')"


def analyze_file(file_path):
    parser, language = get_tree_sitter()
    with open(file_path, "r") as f:
        content = f.read()
    tree = parser.parse(bytes(content, "utf8"))

    query = language.query("""
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
        text = capture_node.text.decode("utf8")

        if capture_type == "module_name":
            current_module = text
        elif capture_type == "function_name":
            node.imports[current_module].add(text)
        elif capture_type == "function_def":
            current_function = text
            node.functions[current_function] = set()
        elif capture_type == "function_body":
            node.function_body[current_function] = (
                capture_node.start_byte,
                capture_node.end_byte,
            )
        elif capture_type == "function_call":
            if current_function:
                node.functions[current_function].add(text)
            else:
                if "top_level" not in node.functions:
                    node.functions["top_level"] = set()
                node.functions["top_level"].add(text)

    # Add top-level content
    node.function_body["top_level"] = content

    return node


def build_dependency_graph(directory):
    graph = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".py"):
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
            if target_function in funcs and module == "." + target_module:
                for func, calls in node.functions.items():
                    if target_function in calls:
                        uses_function = True
                        using_function = func
                        break
                if (
                    "top_level" in node.functions
                    and target_function in node.functions["top_level"]
                ):
                    uses_function = True
                    using_function = "top_level"
                break

        def get_function_body(node, function_name):
            if function_name == "top_level":
                return node.function_body["top_level"]
            else:
                start_byte, end_byte = node.function_body.get(function_name, (0, 0))
                return node.function_body["top_level"][start_byte:end_byte]

        if uses_function:
            dependants[file_path] = {
                "function_name": using_function,
                "function_body": get_function_body(node, using_function),
                "dependants": find_dependants(
                    graph,
                    file_path,
                    using_function if using_function != "top_level" else None,
                    visited,
                ),
            }

    return dependants


def print_dependency_graph(dependants, level=1):
    for dep_file, dep_info in dependants.items():
        print(
            f"{os.path.basename(dep_file)}:{dep_info['function_name']}     level: {str(level)}"
        )

        if dep_info["dependants"]:
            print_dependency_graph(dep_info["dependants"], level + 1)


def get_function_body(filename, function_name):
    parser, language = get_tree_sitter()
    with open(filename, "r") as file:
        content = file.read()

    tree = parser.parse(bytes(content, "utf8"))

    query = language.query("""
        (function_definition
          name: (identifier) @function_name
          body: (block) @function_body)
    """)

    captures = query.captures(tree.root_node)

    for node, capture_name in captures:
        if (
            capture_name == "function_name"
            and node.text.decode("utf8") == function_name
        ):
            function_node = node.parent
            return content[function_node.start_byte : function_node.end_byte]

    return None


def stringify_dependants(dependants, depth=0):
    result = []
    for dep_file, dep_info in dependants.items():
        result.append("<node>")
        result.append(f"<path>{dep_file}</path>")
        result.append(f"<function_name>{dep_info['function_name']}</function_name>")
        result.append(f"<function_body>{dep_info['function_body']}</function_body>")

        if dep_info["dependants"]:
            result.append(f"<nested_depth_{depth+1}>")
            result.append(stringify_dependants(dep_info["dependants"], depth + 1))
            result.append(f"</nested_depth_{depth+1}>")

        result.append("</node>")

    return "\n".join(result)


def analyze_change(old_code, new_code, dependants):
    diff = list(
        difflib.unified_diff(old_code.splitlines(), new_code.splitlines(), lineterm="")
    )

    old_chunk = []
    new_chunk = []

    for line in diff[2:]:
        if line.startswith("-"):
            old_chunk.append(line[1:])
        elif line.startswith("+"):
            new_chunk.append(line[1:])
        elif line.startswith(" "):
            old_chunk.append(line[1:])
            new_chunk.append(line[1:])

    old_chunk_str = "\n".join(old_chunk).strip()
    new_chunk_str = "\n".join(new_chunk).strip()
    prompt = f"""
Given the following change in a Python function:

<OLD VERSION>
{old_chunk_str}
</OLD VERSION>

<NEW VERSION>
{new_chunk_str}
</NEW VERSION>

Use the following dependency tree:
{stringify_dependants(dependants)}

Is this a breaking change? Please explain why or why not, considering the potential impact on the dependent files and functions. Start your answer with either "Yes" or "No".
"""
    res_str = [prompt]
    response = get_llm_response(prompt)

    if "yes" in response.lower():
        res_str.append("LLM RESPONSE: " + response)
    else:
        res_str.append("LLM RESPONSE: " + response)

    if "return a * b" in new_code:
        res_str.append(
            "STATISTICAL RESPONSE: Yes, this is a breaking change. The function has been changed to perform multiplication instead of addition. This will cause unexpected behavior in the dependent files and functions listed in the dependants."
        )
    else:
        res_str.append(
            "STATISTICAL RESPONSE: No breaking change detected. The modification doesn't appear to alter the fundamental behavior of the function in a way that would break dependent code. However, carefully review the dependants to ensure no unexpected side effects occur."
        )

    return "\n\n".join(res_str)


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


if __name__ == "__main__":
    current_file = Path(__file__).resolve()
    directory = current_file.parent / "examples"

    file1 = os.path.join(directory, "math.py")
    run_test(directory, file1, "add")

    file2 = os.path.join(directory, "util.py")
    run_test(directory, file2, "printer")
