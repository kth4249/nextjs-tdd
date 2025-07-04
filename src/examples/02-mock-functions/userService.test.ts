/**
 * 모의 함수 학습을 위한 Jest 테스트 파일
 * 이 파일은 Jest의 Mock Functions를 학습하기 위한 예제입니다.
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
  UserService,
  User,
  Database,
  EmailService,
  Logger,
  processUsers,
  createUserFilter,
  delayedOperation,
  generateUserId,
  getCurrentTimestamp,
  formatUserData,
} from "./userService";

// 1. 모의 함수 기본 사용법
describe("모의 함수 기본 사용법", () => {
  test("jest.fn()으로 기본 모의 함수 생성", () => {
    // jest.fn(): 새로운 모의 함수를 생성
    const mockFunction = jest.fn();

    // 모의 함수 호출
    mockFunction();
    mockFunction("hello");
    mockFunction("world", 123);

    // 호출 횟수 검증
    expect(mockFunction).toHaveBeenCalledTimes(3);

    // 특정 인수로 호출되었는지 검증
    expect(mockFunction).toHaveBeenCalledWith("hello");
    expect(mockFunction).toHaveBeenCalledWith("world", 123);

    // 마지막 호출 인수 검증
    expect(mockFunction).toHaveBeenLastCalledWith("world", 123);

    // 첫 번째 호출 인수 검증
    expect(mockFunction).toHaveBeenNthCalledWith(1, undefined);
    expect(mockFunction).toHaveBeenNthCalledWith(2, "hello");
  });

  test("mockReturnValue로 반환값 설정", () => {
    const mockFunction = jest.fn();

    // 반환값 설정
    mockFunction.mockReturnValue("mocked value");

    const result = mockFunction();
    expect(result).toBe("mocked value");

    // 여러 번 호출해도 같은 값 반환
    expect(mockFunction()).toBe("mocked value");
    expect(mockFunction()).toBe("mocked value");
  });

  test("mockReturnValueOnce로 한 번만 반환값 설정", () => {
    const mockFunction = jest.fn();

    // 각 호출마다 다른 반환값 설정
    mockFunction
      .mockReturnValueOnce("first call")
      .mockReturnValueOnce("second call")
      .mockReturnValue("default value");

    expect(mockFunction()).toBe("first call");
    expect(mockFunction()).toBe("second call");
    expect(mockFunction()).toBe("default value");
    expect(mockFunction()).toBe("default value"); // 기본값 계속 반환
  });
});

// 2. 비동기 함수 모킹
describe("비동기 함수 모킹", () => {
  test("mockResolvedValue로 Promise 반환값 설정", async () => {
    const mockAsyncFunction = jest.fn<() => Promise<string>>();

    // Promise 성공 값 설정
    mockAsyncFunction.mockResolvedValue("async result");

    const result = await mockAsyncFunction();
    expect(result).toBe("async result");

    // 호출 검증
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  test("mockRejectedValue로 Promise 거부 값 설정", async () => {
    const mockAsyncFunction = jest.fn<() => Promise<string>>();

    // Promise 거부 값 설정
    mockAsyncFunction.mockRejectedValue(new Error("async error"));

    // 에러 발생 검증
    await expect(mockAsyncFunction()).rejects.toThrow("async error");

    // 호출 검증
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });
});

// 3. 의존성 주입을 통한 모킹
describe("의존성 주입을 통한 모킹", () => {
  let mockDatabase: jest.Mocked<Database>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockLogger: jest.Mocked<Logger>;
  let userService: UserService;

  // 테스트 데이터
  const testUser: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    isActive: true,
  };

  beforeEach(() => {
    // 모의 객체 생성 - jest.Mocked를 사용하여 타입 안전성 확보
    mockDatabase = {
      findUser: jest.fn(),
      saveUser: jest.fn(),
      deleteUser: jest.fn(),
      getAllUsers: jest.fn(),
    };

    mockEmailService = {
      sendEmail: jest.fn(),
      validateEmail: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // UserService 인스턴스 생성 (의존성 주입)
    userService = new UserService(mockDatabase, mockEmailService, mockLogger);
  });

  afterEach(() => {
    // 각 테스트 후 모의 함수 초기화
    jest.clearAllMocks();
  });

  test("사용자 조회 성공 시나리오", async () => {
    // 모의 함수 설정
    mockDatabase.findUser.mockResolvedValue(testUser);

    // 테스트 실행
    const result = await userService.getUser(1);

    // 결과 검증
    expect(result).toEqual(testUser);

    // 의존성 호출 검증
    expect(mockDatabase.findUser).toHaveBeenCalledWith(1);
    expect(mockDatabase.findUser).toHaveBeenCalledTimes(1);

    // 로그 호출 검증
    expect(mockLogger.info).toHaveBeenCalledWith("사용자 조회 시도: 1");
    expect(mockLogger.info).toHaveBeenCalledWith("사용자 조회 성공: John Doe");
  });

  test("사용자 조회 실패 시나리오", async () => {
    // 모의 함수가 null 반환하도록 설정
    mockDatabase.findUser.mockResolvedValue(null);

    // 테스트 실행
    const result = await userService.getUser(999);

    // 결과 검증
    expect(result).toBeNull();

    // 경고 로그 호출 검증
    expect(mockLogger.warn).toHaveBeenCalledWith("사용자를 찾을 수 없음: 999");
  });

  test("사용자 생성 성공 시나리오", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane@example.com",
      age: 25,
      isActive: true,
    };

    // 모의 함수 설정
    mockEmailService.validateEmail.mockReturnValue(true);
    mockDatabase.saveUser.mockResolvedValue({ ...userData, id: 2 });
    mockEmailService.sendEmail.mockResolvedValue(true);

    // 테스트 실행
    const result = await userService.createUser(userData);

    // 결과 검증
    expect(result).toEqual({
      ...userData,
      id: expect.any(Number),
    });

    // 의존성 호출 검증
    expect(mockEmailService.validateEmail).toHaveBeenCalledWith(userData.email);
    expect(mockDatabase.saveUser).toHaveBeenCalledWith(
      expect.objectContaining(userData)
    );
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      userData.email,
      "환영합니다!",
      `안녕하세요 ${userData.name}님, 회원가입을 축하합니다!`
    );
  });

  test("사용자 생성 실패 시나리오 (잘못된 이메일)", async () => {
    const userData = {
      name: "Invalid User",
      email: "invalid-email",
      age: 25,
      isActive: true,
    };

    // 이메일 유효성 검사 실패 설정
    mockEmailService.validateEmail.mockReturnValue(false);

    // 에러 발생 검증
    await expect(userService.createUser(userData)).rejects.toThrow(
      "유효하지 않은 이메일 주소"
    );

    // 데이터베이스 저장이 호출되지 않았는지 검증
    expect(mockDatabase.saveUser).not.toHaveBeenCalled();

    // 이메일 발송이 호출되지 않았는지 검증
    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });
});

// 4. 콜백 함수 모킹
describe("콜백 함수 모킹", () => {
  test("콜백 함수 호출 검증", () => {
    const users: User[] = [
      {
        id: 1,
        name: "Active User",
        email: "active@example.com",
        age: 30,
        isActive: true,
      },
      {
        id: 2,
        name: "Inactive User",
        email: "inactive@example.com",
        age: 25,
        isActive: false,
      },
      {
        id: 3,
        name: "Another Active",
        email: "another@example.com",
        age: 35,
        isActive: true,
      },
    ];

    // 콜백 함수 모킹
    const mockSuccessCallback = jest.fn();
    const mockErrorCallback = jest.fn();

    // 함수 실행
    processUsers(users, mockSuccessCallback, mockErrorCallback);

    // 성공 콜백이 활성 사용자 수만큼 호출되었는지 검증
    expect(mockSuccessCallback).toHaveBeenCalledTimes(2);
    expect(mockSuccessCallback).toHaveBeenCalledWith(users[0]);
    expect(mockSuccessCallback).toHaveBeenCalledWith(users[2]);

    // 에러 콜백이 호출되지 않았는지 검증
    expect(mockErrorCallback).not.toHaveBeenCalled();
  });
});

// 5. 고차 함수 모킹
describe("고차 함수 모킹", () => {
  test("반환된 함수의 동작 검증", () => {
    const filterFunction = createUserFilter(30);

    const youngUser: User = {
      id: 1,
      name: "Young",
      email: "young@example.com",
      age: 25,
      isActive: true,
    };
    const oldUser: User = {
      id: 2,
      name: "Old",
      email: "old@example.com",
      age: 35,
      isActive: true,
    };

    // 필터 함수 테스트
    expect(filterFunction(youngUser)).toBe(false);
    expect(filterFunction(oldUser)).toBe(true);
  });
});

// 6. 타이머 모킹
describe("타이머 모킹", () => {
  beforeEach(() => {
    // 가짜 타이머 사용
    jest.useFakeTimers();
  });

  afterEach(() => {
    // 실제 타이머 복원
    jest.useRealTimers();
  });

  test("setTimeout 모킹", () => {
    const mockCallback = jest.fn();

    // 지연 실행 함수 호출
    delayedOperation(mockCallback, 1000);

    // 즉시 실행되지 않음 확인
    expect(mockCallback).not.toHaveBeenCalled();

    // 시간 앞당기기 (1초)
    jest.advanceTimersByTime(1000);

    // 콜백 함수 호출 확인
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test("모든 타이머 즉시 실행", () => {
    const mockCallback = jest.fn();

    // 여러 타이머 설정
    delayedOperation(mockCallback, 1000);
    delayedOperation(mockCallback, 2000);
    delayedOperation(mockCallback, 3000);

    // 모든 타이머 즉시 실행
    jest.runAllTimers();

    // 모든 콜백 호출 확인
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });
});

// 7. 전역 객체 모킹
describe("전역 객체 모킹", () => {
  test("Math.random 모킹", () => {
    // Math.random을 모의 함수로 교체
    const mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.5);

    // 함수 호출
    const userId = generateUserId();

    // 예상 결과 검증 (0.5 * 1000000 = 500000)
    expect(userId).toBe(500000);

    // Math.random 호출 검증
    expect(mockRandom).toHaveBeenCalledTimes(1);

    // 원래 구현 복원
    mockRandom.mockRestore();
  });

  test("Date.now 모킹", () => {
    const mockTimestamp = 1234567890123;

    // Date.now를 모의 함수로 교체
    const mockDateNow = jest.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    // 함수 호출
    const timestamp = getCurrentTimestamp();

    // 결과 검증
    expect(timestamp).toBe(mockTimestamp);

    // Date.now 호출 검증
    expect(mockDateNow).toHaveBeenCalledTimes(1);

    // 원래 구현 복원
    mockDateNow.mockRestore();
  });
});

// 8. 모듈 모킹
describe("모듈 모킹", () => {
  test("JSON.stringify 모킹", () => {
    const testUser: User = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      age: 30,
      isActive: true,
    };

    // JSON.stringify를 모의 함수로 교체
    const mockStringify = jest
      .spyOn(JSON, "stringify")
      .mockReturnValue("mocked json");

    // 함수 호출
    const result = formatUserData(testUser);

    // 결과 검증
    expect(result).toBe("mocked json");

    // JSON.stringify 호출 검증
    expect(mockStringify).toHaveBeenCalledWith(testUser, null, 2);

    // 원래 구현 복원
    mockStringify.mockRestore();
  });
});

// 9. 모의 함수 상태 검증
describe("모의 함수 상태 검증", () => {
  test("모의 함수 호출 정보 검증", () => {
    const mockFunction = jest.fn();

    // 다양한 방식으로 함수 호출
    mockFunction();
    mockFunction("arg1");
    mockFunction("arg1", "arg2");
    mockFunction("arg1", "arg2", "arg3");

    // 호출 횟수 검증
    expect(mockFunction).toHaveBeenCalledTimes(4);

    // 모든 호출 정보 접근
    expect(mockFunction.mock.calls).toHaveLength(4);
    expect(mockFunction.mock.calls[0]).toEqual([]);
    expect(mockFunction.mock.calls[1]).toEqual(["arg1"]);
    expect(mockFunction.mock.calls[2]).toEqual(["arg1", "arg2"]);
    expect(mockFunction.mock.calls[3]).toEqual(["arg1", "arg2", "arg3"]);

    // 반환값 설정 후 검증
    mockFunction.mockReturnValue("return value");
    const result = mockFunction("final call");

    expect(result).toBe("return value");
    expect(mockFunction.mock.results).toHaveLength(5);
    expect(mockFunction.mock.results[4]).toEqual({
      type: "return",
      value: "return value",
    });
  });
});

// 10. 모의 함수 구현 교체
describe("모의 함수 구현 교체", () => {
  test("mockImplementation으로 사용자 정의 구현 제공", () => {
    const mockFunction = jest.fn<(a: number, b: number) => number>();

    // 사용자 정의 구현 설정
    mockFunction.mockImplementation((a: number, b: number) => {
      return a * b;
    });

    // 함수 호출 및 검증
    expect(mockFunction(3, 4)).toBe(12);
    expect(mockFunction(5, 6)).toBe(30);

    // 호출 검증
    expect(mockFunction).toHaveBeenCalledTimes(2);
    expect(mockFunction).toHaveBeenCalledWith(3, 4);
    expect(mockFunction).toHaveBeenCalledWith(5, 6);
  });

  test("mockImplementationOnce로 일회성 구현 제공", () => {
    const mockFunction = jest.fn();

    // 각 호출마다 다른 구현 설정
    mockFunction
      .mockImplementationOnce(() => "first call")
      .mockImplementationOnce(() => "second call")
      .mockImplementation(() => "default call");

    // 함수 호출 및 검증
    expect(mockFunction()).toBe("first call");
    expect(mockFunction()).toBe("second call");
    expect(mockFunction()).toBe("default call");
    expect(mockFunction()).toBe("default call");
  });
});
