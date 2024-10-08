import fs from 'fs';
import path from 'path';

interface FunctionInfo {
    summary: string;
    imported_by: string[];
    imports: { [key: string]: string[] };
    function_body: string;
}

interface DependencyNode {
    file_path: string;
    functions: { [key: string]: FunctionInfo };
}

interface CodebaseMapping {
    mapping: { [key: string]: DependencyNode };
    file_aliases: { [key: string]: string };
}

class MappingSearchTool {
    private mapping: CodebaseMapping;

    constructor(mappingFilePath: string) {
        const rawData = fs.readFileSync(mappingFilePath, 'utf8');
        this.mapping = JSON.parse(rawData);
    }

    searchSnippets(functionName: string, filePath: string): any[] {
        const results = [];
        const alias = this.mapping.file_aliases[filePath];
        if (!alias) {
            return results;
        }

        const node = this.mapping.mapping[filePath];
        if (!node) {
            return results;
        }

        const functionInfo = node.functions[functionName];
        if (functionInfo) {
            results.push({
                function: functionName,
                file: filePath,
                summary: functionInfo.summary,
                imported_by: functionInfo.imported_by,
                downstream: this.getDownstream(filePath, functionName, 5)
            });
        }

        return results;
    }

    private getDownstream(filePath: string, functionName: string, depth: number = 5): any[] {
        if (depth === 0) {
            return [];
        }

        const node = this.mapping.mapping[filePath];
        if (!node) {
            return [];
        }

        const functionInfo = node.functions[functionName];
        if (!functionInfo) {
            return [];
        }

        const downstream = [];
        for (const [importedByFile, importedByFunctions] of Object.entries(functionInfo.imported_by)) {
            for (const importedByFunction of importedByFunctions) {
                downstream.push({
                    function: importedByFunction,
                    file: importedByFile,
                    summary: this.mapping.mapping[importedByFile].functions[importedByFunction].summary,
                    downstream: this.getDownstream(importedByFile, importedByFunction, depth - 1)
                });
            }
        }

        return downstream;
    }
}

// Example usage
const mappingFilePath = path.join(__dirname, 'codebase_mapping.json');
const searchTool = new MappingSearchTool(mappingFilePath);

const results = searchTool.searchSnippets('test_function', '/path/to/test.py');
console.log(JSON.stringify(results, null, 2));