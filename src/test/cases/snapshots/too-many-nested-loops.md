**Risk Level 4 - src/test/cases/.cache/5519e4e1b45143a504ec259a5d911dea930372c19b3f56b51afab53f55339b56.ts**

The function `nestedLoops` has too many nested loops which can lead to performance issues and is hard to read and maintain. Consider refactoring the code to reduce the number of nested loops. If the logic of the code allows, you could use recursion or divide the task into smaller functions. Here is an example of how you could refactor this code using recursion:

```
function recursiveLoop(depth, maxDepth, maxCount) {
    if (depth === maxDepth) {
        console.log(...arguments);
    } else {
        for (let i = 0; i < maxCount; i++) {
            recursiveLoop(i, depth + 1, maxDepth, maxCount);
        }
    }
}

recursiveLoop(0, 10, 10);
```

This code does the same thing as the original code but is much easier to read and maintain.

🔄🐌🔧
