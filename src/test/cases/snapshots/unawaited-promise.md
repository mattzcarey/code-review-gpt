**Risk Level 4 - src/test/cases/.cache/eb303e5498352ed36e5d1d2d4a09e085574ec3d2da6564ea0e7ea6caabec7c0f.ts**

1. **Unawaited Promise:** The `fetchData` function returns a promise, and in the `main` function, this promise is called but not awaited or handled. This can lead to unhandled promise rejections and unpredictable behavior. Consider using `await` or `.then().catch()` to handle the promise properly.

```typescript
async function main() {
  try {
    const data = await fetchData()
    console.log(data)
  } catch (error) {
    console.error("Error fetching data:", error)
  }
  console.log("This will log after the promise is resolved")
}

main()
```
