/**
 * 기본 테스트 학습을 위한 계산기 함수들
 * 이 파일은 Jest의 기본 매처들을 학습하기 위한 예제입니다.
 */

// 1. 덧셈 함수 - 가장 기본적인 테스트 대상
export function add(a: number, b: number): number {
  return a + b;
}

// 2. 뺄셈 함수
export function subtract(a: number, b: number): number {
  return a - b;
}

// 3. 곱셈 함수
export function multiply(a: number, b: number): number {
  return a * b;
}

// 4. 나눗셈 함수 - 예외 처리 테스트를 위한 함수
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

// 5. 소수점 계산 함수 - 정밀도 테스트를 위한 함수
export function addDecimal(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100;
}

// 6. 배열 합계 함수 - 배열 테스트를 위한 함수
export function sumArray(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// 7. 객체 반환 함수 - 객체 테스트를 위한 함수
export function createCalculationResult(
  operation: string,
  a: number,
  b: number,
  result: number
): { operation: string; operands: number[]; result: number; timestamp: Date } {
  return {
    operation,
    operands: [a, b],
    result,
    timestamp: new Date(),
  };
}

// 8. 팩토리얼 함수 - 재귀 함수 테스트를 위한 함수
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// 9. 짝수/홀수 판별 함수 - 불린 테스트를 위한 함수
export function isEven(n: number): boolean {
  return n % 2 === 0;
}

// 10. 최대값 찾기 함수 - 가변 인수 테스트를 위한 함수
export function findMax(...numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error("At least one number is required");
  }
  return Math.max(...numbers);
}
