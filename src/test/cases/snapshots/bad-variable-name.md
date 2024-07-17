**Risk Level 3 - src/test/cases/.cache/4362c4ad1e9424e68ec4e05de677b73b56239f408e0c2cf41517aada1ea2cbf8.ts**

1. **Bad Variable Naming**: Using single-letter variables (`a`, `b`, `c`, `x`, `y`, `z`) significantly reduces code readability and maintainability. It is a high priority to use meaningful variable names in production code to adhere to best practices.

```typescript
function addNums(num1: number, num2: number): number {
  let firstNumber = num1
  let secondNumber = num2
  let sum = firstNumber + secondNumber
  return sum
}

// Example usage of the function
let num1 = 5
let num2 = 10
let result = addNums(num1, num2)
console.log("The sum is: " + result)
```
