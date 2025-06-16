import { test, expect } from 'vitest';
import { 
  add, 
  multiply, 
  factorial, 
  isPrime, 
  impureIncrement, 
  getCurrentTimestamp 
} from '../../src/1-pure-functions/math.js';

// Тести чистих функцій - add
test('add should add two positive numbers', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(10, 20)).toBe(30);
});

test('add should add negative numbers', () => {
  expect(add(-5, -3)).toBe(-8);
  expect(add(-5, 3)).toBe(-2);
});

test('add should add zero', () => {
  expect(add(0, 5)).toBe(5);
  expect(add(5, 0)).toBe(5);
});

test('add should always return the same result for the same inputs', () => {
  // Демонстрація детермінованості чистих функцій
  const result1 = add(3, 4);
  const result2 = add(3, 4);
  const result3 = add(3, 4);
  
  expect(result1).toBe(result2);
  expect(result2).toBe(result3);
  expect(result1).toBe(7);
});

// Тести чистих функцій - multiply
test('multiply should multiply two numbers', () => {
  expect(multiply(3, 4)).toBe(12);
  expect(multiply(-2, 5)).toBe(-10);
  expect(multiply(0, 100)).toBe(0);
});

// Тести чистих функцій - factorial
test('factorial should calculate factorial of positive numbers', () => {
  expect(factorial(0)).toBe(1);
  expect(factorial(1)).toBe(1);
  expect(factorial(5)).toBe(120);
  expect(factorial(3)).toBe(6);
});

test('factorial should throw error for negative numbers', () => {
  expect(() => factorial(-1)).toThrow('Factorial is not defined for negative numbers');
  expect(() => factorial(-5)).toThrow();
});

// Тести чистих функцій - isPrime
test('isPrime should correctly identify prime numbers', () => {
  expect(isPrime(2)).toBe(true);
  expect(isPrime(3)).toBe(true);
  expect(isPrime(5)).toBe(true);
  expect(isPrime(17)).toBe(true);
});

test('isPrime should correctly identify non-prime numbers', () => {
  expect(isPrime(1)).toBe(false);
  expect(isPrime(4)).toBe(false);
  expect(isPrime(9)).toBe(false);
  expect(isPrime(15)).toBe(false);
});

test('isPrime should handle edge cases', () => {
  expect(isPrime(0)).toBe(false);
  expect(isPrime(-5)).toBe(false);
});

// Тести нечистих функцій для порівняння
test('impureIncrement demonstrates non-deterministic behavior', () => {
  // Ці тести показують, чому тестувати нечисті функції складніше
  const result1 = impureIncrement();
  const result2 = impureIncrement();
  const result3 = impureIncrement();
  
  // Кожен виклик повертає різний результат
  expect(result1).not.toBe(result2);
  expect(result2).not.toBe(result3);
  expect(result3).toBe(result1 + 2);
});

test('getCurrentTimestamp demonstrates time-dependent behavior', () => {
  const timestamp1 = getCurrentTimestamp();
  
  // Невелика затримка
  const start = Date.now();
  while (Date.now() - start < 10) {
    // Busy wait
  }
  
  const timestamp2 = getCurrentTimestamp();
  
  // Час завжди йде вперед
  expect(timestamp2).toBeGreaterThan(timestamp1);
}); 