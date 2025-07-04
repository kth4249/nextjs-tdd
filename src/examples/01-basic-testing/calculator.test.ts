/**
 * 기본 테스트 학습을 위한 Jest 테스트 파일
 * 이 파일은 Jest의 다양한 매처들을 학습하기 위한 예제입니다.
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  add,
  subtract,
  multiply,
  divide,
  addDecimal,
  sumArray,
  createCalculationResult,
  factorial,
  isEven,
  findMax,
} from "./calculator";

// describe: 테스트 그룹을 만들어 관련된 테스트들을 묶어줍니다.
describe("Calculator Functions", () => {
  // beforeEach: 각 테스트 실행 전에 실행되는 설정 함수
  beforeEach(() => {
    console.log("테스트 시작 전 준비 작업");
  });

  // afterEach: 각 테스트 실행 후에 실행되는 정리 함수
  afterEach(() => {
    console.log("테스트 완료 후 정리 작업");
  });

  // 1. 기본 매처 테스트 - toBe, toEqual
  describe("기본 매처 테스트", () => {
    test("덧셈 함수는 두 숫자를 더해야 합니다", () => {
      // toBe: 원시 값(primitive value)의 정확한 일치를 검사
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });

    test("뺄셈 함수는 두 숫자를 빼야 합니다", () => {
      expect(subtract(5, 3)).toBe(2);
      expect(subtract(0, 5)).toBe(-5);
    });

    test("곱셈 함수는 두 숫자를 곱해야 합니다", () => {
      expect(multiply(3, 4)).toBe(12);
      expect(multiply(-2, 3)).toBe(-6);
      expect(multiply(0, 100)).toBe(0);
    });
  });

  // 2. 예외 처리 테스트 - toThrow
  describe("예외 처리 테스트", () => {
    test("0으로 나누면 에러가 발생해야 합니다", () => {
      // toThrow: 함수가 예외를 던지는지 검사
      expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
      expect(() => divide(10, 0)).toThrow(Error);
    });

    test("음수 팩토리얼은 에러가 발생해야 합니다", () => {
      expect(() => factorial(-1)).toThrow(
        "Factorial is not defined for negative numbers"
      );
    });

    test("최대값 함수에 인수가 없으면 에러가 발생해야 합니다", () => {
      expect(() => findMax()).toThrow("At least one number is required");
    });
  });

  // 3. 숫자 관련 매처 테스트 - toBeCloseTo, toBeGreaterThan 등
  describe("숫자 관련 매처 테스트", () => {
    test("소수점 계산 결과는 근사값이어야 합니다", () => {
      // toBeCloseTo: 부동소수점 수의 근사값을 검사
      expect(addDecimal(0.1, 0.2)).toBeCloseTo(0.3, 2);
    });

    test("나눗셈 결과는 특정 값보다 커야 합니다", () => {
      // toBeGreaterThan: 값이 더 큰지 검사
      expect(divide(10, 2)).toBeGreaterThan(4);
      // toBeGreaterThanOrEqual: 값이 크거나 같은지 검사
      expect(divide(10, 2)).toBeGreaterThanOrEqual(5);
    });

    test("팩토리얼 결과는 특정 값보다 작아야 합니다", () => {
      // toBeLessThan: 값이 더 작은지 검사
      expect(factorial(3)).toBeLessThan(10);
      // toBeLessThanOrEqual: 값이 작거나 같은지 검사
      expect(factorial(3)).toBeLessThanOrEqual(6);
    });
  });

  // 4. 불린 관련 매처 테스트 - toBeTruthy, toBeFalsy
  describe("불린 관련 매처 테스트", () => {
    test("짝수 판별 함수는 올바른 불린 값을 반환해야 합니다", () => {
      // toBeTruthy: 값이 참인지 검사 (true, 1, "hello", [] 등)
      expect(isEven(2)).toBeTruthy();
      expect(isEven(4)).toBe(true);

      // toBeFalsy: 값이 거짓인지 검사 (false, 0, "", null, undefined 등)
      expect(isEven(3)).toBeFalsy();
      expect(isEven(5)).toBe(false);
    });

    test("존재하지 않는 값들을 테스트합니다", () => {
      const undefinedValue = undefined;
      const nullValue = null;

      // toBeUndefined: 값이 undefined인지 검사
      expect(undefinedValue).toBeUndefined();

      // toBeNull: 값이 null인지 검사
      expect(nullValue).toBeNull();

      // toBeDefined: 값이 정의되어 있는지 검사
      expect(add(1, 2)).toBeDefined();
    });
  });

  // 5. 배열 관련 매처 테스트 - toContain, toHaveLength
  describe("배열 관련 매처 테스트", () => {
    test("배열 합계 함수는 올바른 결과를 반환해야 합니다", () => {
      const numbers = [1, 2, 3, 4, 5];

      // toHaveLength: 배열의 길이를 검사
      expect(numbers).toHaveLength(5);

      // toContain: 배열이 특정 값을 포함하는지 검사
      expect(numbers).toContain(3);
      expect(numbers).toContain(5);

      // 배열 합계 검사
      expect(sumArray(numbers)).toBe(15);
    });

    test("최대값 찾기 함수는 배열에서 최대값을 찾아야 합니다", () => {
      const testNumbers = [1, 5, 3, 9, 2];
      expect(findMax(...testNumbers)).toBe(9);
    });
  });

  // 6. 객체 관련 매처 테스트 - toEqual, toHaveProperty
  describe("객체 관련 매처 테스트", () => {
    test("계산 결과 객체는 올바른 구조를 가져야 합니다", () => {
      const result = createCalculationResult("add", 2, 3, 5);

      // toHaveProperty: 객체가 특정 속성을 가지는지 검사
      expect(result).toHaveProperty("operation");
      expect(result).toHaveProperty("operands");
      expect(result).toHaveProperty("result");
      expect(result).toHaveProperty("timestamp");

      // 속성 값 검사
      expect(result).toHaveProperty("operation", "add");
      expect(result).toHaveProperty("result", 5);
    });

    test("계산 결과 객체의 구조를 완전히 검사합니다", () => {
      const result = createCalculationResult("multiply", 4, 5, 20);

      // toEqual: 객체의 모든 속성을 재귀적으로 비교 (깊은 비교)
      expect(result).toEqual({
        operation: "multiply",
        operands: [4, 5],
        result: 20,
        timestamp: expect.any(Date), // 날짜 타입인지만 검사
      });

      // 배열 속성 검사
      expect(result.operands).toEqual([4, 5]);
      expect(result.operands).toHaveLength(2);
    });
  });

  // 7. 문자열 관련 매처 테스트 - toMatch
  describe("문자열 관련 매처 테스트", () => {
    test("에러 메시지 형식을 검사합니다", () => {
      try {
        divide(10, 0);
      } catch (error) {
        // toMatch: 문자열이 정규식 패턴과 일치하는지 검사
        expect((error as Error).message).toMatch(/divide/);
        expect((error as Error).message).toMatch(/zero/);
      }
    });
  });

  // 8. 타입 관련 매처 테스트 - toBeInstanceOf
  describe("타입 관련 매처 테스트", () => {
    test("계산 결과의 타임스탬프는 Date 객체여야 합니다", () => {
      const result = createCalculationResult("add", 1, 1, 2);

      // toBeInstanceOf: 객체가 특정 클래스의 인스턴스인지 검사
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  // 9. 복합 테스트 - 여러 매처를 조합한 테스트
  describe("복합 테스트", () => {
    test("팩토리얼 함수의 다양한 케이스를 검사합니다", () => {
      // 기본 케이스
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(3)).toBe(6);
      expect(factorial(5)).toBe(120);

      // 결과가 양수인지 검사
      expect(factorial(4)).toBeGreaterThan(0);

      // 결과가 정수인지 검사
      expect(factorial(4) % 1).toBe(0);
    });
  });
});

// 10. 별도의 describe 블록 - 성능 테스트
describe("성능 테스트", () => {
  test("대용량 배열 합계 계산 성능", () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i + 1);

    const startTime = performance.now();
    const result = sumArray(largeArray);
    const endTime = performance.now();

    // 결과 검증
    expect(result).toBe(50005000); // 1부터 10000까지의 합

    // 실행 시간 검증 (100ms 이하)
    expect(endTime - startTime).toBeLessThan(100);
  });
});
