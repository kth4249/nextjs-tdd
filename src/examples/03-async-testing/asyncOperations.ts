/**
 * 비동기 코드 테스트 학습을 위한 예제 함수들
 * 이 파일은 Jest의 비동기 코드 테스트 기능을 학습하기 위한 예제입니다.
 */

// 1. 기본 Promise 함수
export function fetchUserData(
  userId: number
): Promise<{ id: number; name: string; email: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 1) {
        resolve({ id: 1, name: "John Doe", email: "john@example.com" });
      } else if (userId === 2) {
        resolve({ id: 2, name: "Jane Smith", email: "jane@example.com" });
      } else {
        reject(new Error("User not found"));
      }
    }, 100);
  });
}

// 2. async/await 함수
export async function processUserData(userId: number): Promise<string> {
  try {
    const user = await fetchUserData(userId);
    return `처리된 사용자: ${user.name} (${user.email})`;
  } catch (error) {
    throw new Error(`사용자 데이터 처리 실패: ${(error as Error).message}`);
  }
}

// 3. 여러 비동기 작업을 순차적으로 처리
export async function processMultipleUsers(
  userIds: number[]
): Promise<string[]> {
  const results: string[] = [];

  for (const userId of userIds) {
    try {
      const processed = await processUserData(userId);
      results.push(processed);
    } catch (error) {
      results.push(`Error: ${(error as Error).message}`);
    }
  }

  return results;
}

// 4. 여러 비동기 작업을 병렬로 처리
export async function processUsersParallel(
  userIds: number[]
): Promise<string[]> {
  const promises = userIds.map(async (userId) => {
    try {
      return await processUserData(userId);
    } catch (error) {
      return `Error: ${(error as Error).message}`;
    }
  });

  return Promise.all(promises);
}

// 5. 타임아웃이 있는 비동기 함수
export function fetchWithTimeout<T>(
  operation: () => Promise<T>,
  timeout: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Operation timed out"));
    }, timeout);

    operation()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// 6. 재시도 로직이 있는 비동기 함수
export async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw new Error(
          `최대 재시도 횟수 초과 (${maxRetries}회): ${lastError.message}`
        );
      }

      // 지수적 백오프 (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 100 * Math.pow(2, attempt - 1))
      );
    }
  }

  throw lastError!;
}

// 7. 콜백 기반 비동기 함수
export function fetchUserCallback(
  userId: number,
  callback: (
    error: Error | null,
    user?: { id: number; name: string; email: string }
  ) => void
): void {
  setTimeout(() => {
    if (userId === 1) {
      callback(null, { id: 1, name: "John Doe", email: "john@example.com" });
    } else if (userId === 2) {
      callback(null, { id: 2, name: "Jane Smith", email: "jane@example.com" });
    } else {
      callback(new Error("User not found"));
    }
  }, 50);
}

// 8. 콜백을 Promise로 변환하는 유틸리티 함수
export function promisifyCallback(
  userId: number
): Promise<{ id: number; name: string; email: string }> {
  return new Promise((resolve, reject) => {
    fetchUserCallback(userId, (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(user!);
      }
    });
  });
}

// 9. 스트림 처리를 시뮬레이션하는 함수
export async function* generateUserStream(
  userIds: number[]
): AsyncGenerator<{ id: number; name: string; email: string }, void, unknown> {
  for (const userId of userIds) {
    try {
      const user = await fetchUserData(userId);
      yield user;
    } catch (error) {
      // 에러가 발생해도 스트림을 계속 진행
      console.error(`Failed to fetch user ${userId}:`, error);
    }
  }
}

// 10. 경합 조건(race condition)을 테스트하기 위한 함수
export async function raceConditionTest(
  operation1: () => Promise<string>,
  operation2: () => Promise<string>
): Promise<string> {
  return Promise.race([operation1(), operation2()]);
}

// 11. 에러 핸들링과 정리 작업이 있는 함수
export async function complexAsyncOperation(
  shouldFail: boolean = false
): Promise<string> {
  let resource: string | null = null;

  try {
    // 리소스 할당
    resource = await new Promise<string>((resolve) => {
      setTimeout(() => resolve("allocated resource"), 50);
    });

    // 메인 작업
    if (shouldFail) {
      throw new Error("작업 실패");
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });

    return `작업 완료: ${resource}`;
  } finally {
    // 정리 작업
    if (resource) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`리소스 정리: ${resource}`);
          resolve();
        }, 25);
      });
    }
  }
}

// 12. 조건부 비동기 실행
export async function conditionalAsync(condition: boolean): Promise<string> {
  if (condition) {
    return new Promise((resolve) => {
      setTimeout(() => resolve("비동기 결과"), 100);
    });
  } else {
    return "동기 결과";
  }
}
