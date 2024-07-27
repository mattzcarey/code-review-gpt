import unittest
import os
import tempfile
import shutil
from codebase_mapping import CodebaseMappingTool

class TestCodebaseMappingTool(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.mapping_tool = CodebaseMappingTool()

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def create_test_file(self, filename, content):
        file_path = os.path.join(self.temp_dir, filename)
        with open(file_path, 'w') as f:
            f.write(content)
        return file_path

    def test_build_mapping(self):
        test_file = self.create_test_file('test.py', '''
def test_function():
    """This is a test function."""
    return "Hello, World!"

def another_function():
    return test_function()
''')

        self.mapping_tool.build_mapping(self.temp_dir)

        self.assertIn(test_file, self.mapping_tool.mapping.mapping)
        self.assertIn('test_function', self.mapping_tool.mapping.mapping[test_file].functions)
        self.assertIn('another_function', self.mapping_tool.mapping.mapping[test_file].functions)

    def test_update_mapping(self):
        test_file = self.create_test_file('test.py', '''
def test_function():
    return "Hello, World!"
''')

        self.mapping_tool.build_mapping(self.temp_dir)

        diff = '''
diff --git a/test.py b/test.py
index 1234567..abcdefg 100644
--- a/test.py
+++ b/test.py
@@ -1,2 +1,5 @@
 def test_function():
-    return "Hello, World!"
+    return "Hello, Updated World!"
+
+def new_function():
+    return "I'm new here!"
'''

        self.mapping_tool.update_mapping(diff)

        self.assertIn('new_function', self.mapping_tool.mapping.mapping[test_file].functions)
        self.assertIn('Hello, Updated World!', self.mapping_tool.mapping.mapping[test_file].functions['test_function'].function_body)

    def test_search_snippets(self):
        test_file = self.create_test_file('test.py', '''
def test_function():
    return "Hello, World!"

def another_function():
    return test_function()
''')

        self.mapping_tool.build_mapping(self.temp_dir)

        results = self.mapping_tool.search_snippets('test_function', test_file)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['function'], 'test_function')
        self.assertIn('another_function', [d['function'] for d in results[0]['downstream']])

if __name__ == '__main__':
    unittest.main()