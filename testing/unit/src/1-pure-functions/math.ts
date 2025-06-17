// Чисті функції - завжди повертають однаковий результат для однакових параметрів
// і не мають побічних ефектів

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial is not defined for negative numbers');
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Приклад НЕ чистої функції для порівняння
let counter = 0;

export function impureIncrement(): number {
  return ++counter; // Побічний ефект - змінює глобальну змінну
}

export function getCurrentTimestamp(): number {
  return Date.now(); // Недетермінована - залежить від зовнішнього стану
} 