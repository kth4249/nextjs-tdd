/**
 * 비동기 코드 테스트 학습을 위한 Jest 테스트 파일
 * 이 파일은 Jest의 비동기 코드 테스트 기능을 학습하기 위한 예제입니다.
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  fetchUserData,
  processUserData,
  processMultipleUsers,
  processUsersParallel,
  fetchWithTimeout,
  fetchWithRetry,
  fetchUserCallback,
  promisifyCallback,
  generateUserStream,
  raceConditionTest,
  complexAsyncOperation,
  conditionalAsync,
} from "./asyncOperations";

// 1. Promise 기반 비동기 함수 테스트
describe("Promise 기반 비동기 함수 테스트", () => {
  test("성공적인 사용자 데이터 조회 - Promise를 반환", () => {
    // Promise를 반환하는 방법 (Jest가 Promise가 완료될 때까지 기다림)
    return fetchUserData(1).then((user) => {
      expect(user).toEqual({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
      });
    });
  });

  test("실패하는 사용자 데이터 조회 - Promise 거부", () => {
    // Promise 거부를 테스트하는 방법
    return fetchUserData(999).catch((error) => {
      expect(error.message).toBe("User not found");
    });
  });

  test("Promise 거부 테스트 - expect.rejects 사용", async () => {
    // expect.rejects를 사용하여 Promise 거부 테스트
    await expect(fetchUserData(999)).rejects.toThrow("User not found");
  });

  test("Promise 성공 테스트 - expect.resolves 사용", async () => {
    // expect.resolves를 사용하여 Promise 성공 테스트
    await expect(fetchUserData(1)).resolves.toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
  });
});

// 2. async/await 기반 비동기 함수 테스트
describe("async/await 기반 비동기 함수 테스트", () => {
  test("성공적인 사용자 데이터 처리 - async/await", async () => {
    // async/await를 사용한 비동기 테스트
    const result = await processUserData(1);
    expect(result).toBe("처리된 사용자: John Doe (john@example.com)");
  });

  test("실패하는 사용자 데이터 처리 - async/await", async () => {
    // async/await에서 에러 처리 테스트
    try {
      await processUserData(999);
      // 이 줄에 도달하면 테스트 실패
      throw new Error("Expected an error to be thrown");
    } catch (error) {
      expect((error as Error).message).toBe(
        "사용자 데이터 처리 실패: User not found"
      );
    }
  });

  test("async/await 에러 테스트 - expect.rejects", async () => {
    // expect.rejects를 사용한 더 간단한 에러 테스트
    await expect(processUserData(999)).rejects.toThrow(
      "사용자 데이터 처리 실패: User not found"
    );
  });
});

// 3. 여러 비동기 작업 테스트
describe("여러 비동기 작업 테스트", () => {
  test("순차적 처리 테스트", async () => {
    const userIds = [1, 2, 999];
    const results = await processMultipleUsers(userIds);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe("처리된 사용자: John Doe (john@example.com)");
    expect(results[1]).toBe("처리된 사용자: Jane Smith (jane@example.com)");
    expect(results[2]).toMatch(/Error: 사용자 데이터 처리 실패/);
  });

  test("병렬 처리 테스트", async () => {
    const userIds = [1, 2];
    const startTime = Date.now();

    const results = await processUsersParallel(userIds);
    const endTime = Date.now();

    // 결과 검증
    expect(results).toHaveLength(2);
    expect(results[0]).toBe("처리된 사용자: John Doe (john@example.com)");
    expect(results[1]).toBe("처리된 사용자: Jane Smith (jane@example.com)");

    // 병렬 처리로 인한 시간 단축 검증 (200ms 이하)
    expect(endTime - startTime).toBeLessThan(200);
  });

  test("병렬 처리 에러 포함 테스트", async () => {
    const userIds = [1, 999, 2];
    const results = await processUsersParallel(userIds);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe("처리된 사용자: John Doe (john@example.com)");
    expect(results[1]).toMatch(/Error: 사용자 데이터 처리 실패/);
    expect(results[2]).toBe("처리된 사용자: Jane Smith (jane@example.com)");
  });
});

// 4. 타임아웃 테스트
describe("타임아웃 테스트", () => {
  test("타임아웃 내에서 성공하는 경우", async () => {
    const operation = () => fetchUserData(1);

    const result = await fetchWithTimeout(operation, 200);
    expect(result).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
  });

  test("타임아웃 발생하는 경우", async () => {
    const slowOperation = () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("slow result"), 200);
      });

    await expect(fetchWithTimeout(slowOperation, 50)).rejects.toThrow(
      "Operation timed out"
    );
  });
});

// 5. 재시도 로직 테스트
describe("재시도 로직 테스트", () => {
  test("첫 번째 시도에서 성공", async () => {
    const successOperation = jest
      .fn<() => Promise<string>>()
      .mockResolvedValue("success");

    const result = await fetchWithRetry(successOperation, 3);

    expect(result).toBe("success");
    expect(successOperation).toHaveBeenCalledTimes(1);
  });

  test("두 번째 시도에서 성공", async () => {
    const retryOperation = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("first failure"))
      .mockResolvedValue("success");

    const result = await fetchWithRetry(retryOperation, 3);

    expect(result).toBe("success");
    expect(retryOperation).toHaveBeenCalledTimes(2);
  });

  test("최대 재시도 횟수 초과", async () => {
    const failingOperation = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error("persistent failure"));

    await expect(fetchWithRetry(failingOperation, 2)).rejects.toThrow(
      "최대 재시도 횟수 초과 (2회): persistent failure"
    );

    expect(failingOperation).toHaveBeenCalledTimes(2);
  });
});

// 6. 콜백 기반 비동기 함수 테스트
describe("콜백 기반 비동기 함수 테스트", () => {
  test("콜백 함수 성공 테스트", (done) => {
    // done 콜백을 사용한 비동기 테스트
    fetchUserCallback(1, (error, user) => {
      try {
        expect(error).toBeNull();
        expect(user).toEqual({
          id: 1,
          name: "John Doe",
          email: "john@example.com",
        });
        done(); // 테스트 완료 신호
      } catch (testError) {
        done(testError as Error); // 테스트 실패 신호
      }
    });
  });

  test("콜백 함수 에러 테스트", (done) => {
    fetchUserCallback(999, (error, user) => {
      try {
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toBe("User not found");
        expect(user).toBeUndefined();
        done();
      } catch (testError) {
        done(testError as Error);
      }
    });
  });

  test("콜백을 Promise로 변환한 함수 테스트", async () => {
    const user = await promisifyCallback(1);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
  });
});

// 7. 비동기 제너레이터 테스트
describe("비동기 제너레이터 테스트", () => {
  test("사용자 스트림 처리", async () => {
    const userIds = [1, 2];
    const users = [];

    // 비동기 제너레이터 사용
    for await (const user of generateUserStream(userIds)) {
      users.push(user);
    }

    expect(users).toHaveLength(2);
    expect(users[0]).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
    expect(users[1]).toEqual({
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
    });
  });

  test("에러가 포함된 스트림 처리", async () => {
    const userIds = [1, 999, 2]; // 999는 에러 발생
    const users = [];

    // 콘솔 에러 모킹
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    for await (const user of generateUserStream(userIds)) {
      users.push(user);
    }

    // 에러가 발생해도 유효한 사용자만 수집됨
    expect(users).toHaveLength(2);
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});

// 8. 경합 조건 테스트
describe("경합 조건 테스트", () => {
  test("더 빠른 작업이 승리", async () => {
    const fastOperation = () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("fast result"), 50);
      });

    const slowOperation = () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("slow result"), 200);
      });

    const result = await raceConditionTest(fastOperation, slowOperation);
    expect(result).toBe("fast result");
  });

  test("에러가 먼저 발생하는 경우", async () => {
    const errorOperation = () =>
      new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("error occurred")), 50);
      });

    const slowOperation = () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("slow result"), 200);
      });

    await expect(
      raceConditionTest(errorOperation, slowOperation)
    ).rejects.toThrow("error occurred");
  });
});

// 9. 복잡한 비동기 작업 테스트
describe("복잡한 비동기 작업 테스트", () => {
  test("성공적인 복잡한 작업", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await complexAsyncOperation(false);

    expect(result).toBe("작업 완료: allocated resource");
    expect(consoleSpy).toHaveBeenCalledWith("리소스 정리: allocated resource");

    consoleSpy.mockRestore();
  });

  test("실패하는 복잡한 작업 - finally 블록 실행 확인", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      await complexAsyncOperation(true);
      throw new Error("Expected an error to be thrown");
    } catch (error) {
      expect((error as Error).message).toBe("작업 실패");
      // finally 블록이 실행되어 리소스 정리가 이루어짐
      expect(consoleSpy).toHaveBeenCalledWith(
        "리소스 정리: allocated resource"
      );
    }

    consoleSpy.mockRestore();
  });
});

// 10. 조건부 비동기 실행 테스트
describe("조건부 비동기 실행 테스트", () => {
  test("조건이 참일 때 비동기 실행", async () => {
    const startTime = Date.now();
    const result = await conditionalAsync(true);
    const endTime = Date.now();

    expect(result).toBe("비동기 결과");
    expect(endTime - startTime).toBeGreaterThan(50); // 비동기 실행 시간 검증
  });

  test("조건이 거짓일 때 동기 실행", async () => {
    const startTime = Date.now();
    const result = await conditionalAsync(false);
    const endTime = Date.now();

    expect(result).toBe("동기 결과");
    expect(endTime - startTime).toBeLessThan(50); // 동기 실행 시간 검증
  });
});

// 11. 타이머 기반 비동기 테스트
describe("타이머 기반 비동기 테스트", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("가짜 타이머를 사용한 비동기 테스트", async () => {
    const promise = fetchUserData(1);

    // 타이머 시간 앞당기기
    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
  });

  test("모든 타이머 완료 후 테스트", async () => {
    const promise = fetchUserData(1);

    // 모든 타이머 완료
    jest.runAllTimers();

    const result = await promise;
    expect(result).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });
  });
});

// 12. 성능 기반 비동기 테스트
describe("성능 기반 비동기 테스트", () => {
  test("비동기 작업 실행 시간 측정", async () => {
    const startTime = performance.now();

    await fetchUserData(1);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 100ms 근처에서 실행되어야 함 (오차 범위: ±50ms)
    expect(duration).toBeGreaterThan(50);
    expect(duration).toBeLessThan(200);
  });

  test("병렬 처리 성능 개선 검증", async () => {
    const userIds = [1, 2];

    // 순차 처리 시간 측정
    const sequentialStart = performance.now();
    await processMultipleUsers(userIds);
    const sequentialEnd = performance.now();
    const sequentialTime = sequentialEnd - sequentialStart;

    // 병렬 처리 시간 측정
    const parallelStart = performance.now();
    await processUsersParallel(userIds);
    const parallelEnd = performance.now();
    const parallelTime = parallelEnd - parallelStart;

    // 병렬 처리가 순차 처리보다 빠른지 검증
    expect(parallelTime).toBeLessThan(sequentialTime);
  });
});
