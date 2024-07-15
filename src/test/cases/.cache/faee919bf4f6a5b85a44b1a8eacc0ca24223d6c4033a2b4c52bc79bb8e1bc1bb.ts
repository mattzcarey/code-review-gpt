
// Test Case: Exposed secret
// Description: A code snippet with exposed secret

const secretKey = "1234567890abcdef"; // Exposed secret

function useSecret() {
    console.log(`The secret key is ${secretKey}`);
}

useSecret();
