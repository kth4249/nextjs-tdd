/**
 * 모의 함수 학습을 위한 사용자 서비스 예제
 * 이 파일은 Jest의 Mock Functions를 학습하기 위한 예제입니다.
 */

// 사용자 타입 정의
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// 콜백 함수 타입 정의
export type UserCallback = (user: User) => void;
export type ErrorCallback = (error: Error) => void;

// 1. 데이터베이스 모킹을 위한 인터페이스
export interface Database {
  findUser(id: number): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
}

// 2. 외부 API 모킹을 위한 인터페이스
export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  validateEmail(email: string): boolean;
}

// 3. 로거 모킹을 위한 인터페이스
export interface Logger {
  info(message: string): void;
  error(message: string, error?: Error): void;
  warn(message: string): void;
}

// 4. 콜백 함수를 사용하는 유틸리티 함수들
export class UserService {
  constructor(
    private database: Database,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  // 사용자 조회 (의존성 주입된 데이터베이스 사용)
  async getUser(id: number): Promise<User | null> {
    this.logger.info(`사용자 조회 시도: ${id}`);

    try {
      const user = await this.database.findUser(id);

      if (user) {
        this.logger.info(`사용자 조회 성공: ${user.name}`);
      } else {
        this.logger.warn(`사용자를 찾을 수 없음: ${id}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`사용자 조회 실패: ${id}`, error as Error);
      throw error;
    }
  }

  // 사용자 생성 (이메일 유효성 검사 포함)
  async createUser(userData: Omit<User, "id">): Promise<User> {
    this.logger.info(`사용자 생성 시도: ${userData.name}`);

    // 이메일 유효성 검사
    if (!this.emailService.validateEmail(userData.email)) {
      const error = new Error("유효하지 않은 이메일 주소");
      this.logger.error("이메일 유효성 검사 실패", error);
      throw error;
    }

    // 새 사용자 생성
    const newUser: User = {
      ...userData,
      id: Date.now(), // 실제로는 데이터베이스에서 생성된 ID 사용
    };

    try {
      const savedUser = await this.database.saveUser(newUser);

      // 환영 이메일 발송
      await this.emailService.sendEmail(
        savedUser.email,
        "환영합니다!",
        `안녕하세요 ${savedUser.name}님, 회원가입을 축하합니다!`
      );

      this.logger.info(`사용자 생성 성공: ${savedUser.name}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`사용자 생성 실패: ${userData.name}`, error as Error);
      throw error;
    }
  }

  // 사용자 삭제
  async deleteUser(id: number): Promise<boolean> {
    this.logger.info(`사용자 삭제 시도: ${id}`);

    try {
      const user = await this.database.findUser(id);
      if (!user) {
        this.logger.warn(`삭제할 사용자를 찾을 수 없음: ${id}`);
        return false;
      }

      const deleted = await this.database.deleteUser(id);

      if (deleted) {
        this.logger.info(`사용자 삭제 성공: ${user.name}`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`사용자 삭제 실패: ${id}`, error as Error);
      throw error;
    }
  }

  // 활성 사용자 목록 조회
  async getActiveUsers(): Promise<User[]> {
    this.logger.info("활성 사용자 목록 조회");

    try {
      const allUsers = await this.database.getAllUsers();
      const activeUsers = allUsers.filter((user) => user.isActive);

      this.logger.info(`활성 사용자 ${activeUsers.length}명 조회`);
      return activeUsers;
    } catch (error) {
      this.logger.error("활성 사용자 목록 조회 실패", error as Error);
      throw error;
    }
  }
}

// 5. 콜백 함수를 사용하는 유틸리티 함수들
export function processUsers(
  users: User[],
  onSuccess: UserCallback,
  onError: ErrorCallback
): void {
  try {
    users.forEach((user) => {
      if (user.isActive) {
        onSuccess(user);
      }
    });
  } catch (error) {
    onError(error as Error);
  }
}

// 6. 고차 함수 (Higher-Order Function)
export function createUserFilter(minAge: number): (user: User) => boolean {
  return (user: User) => user.age >= minAge;
}

// 7. 시간 관련 함수 (타이머 모킹을 위한 함수)
export function delayedOperation(operation: () => void, delay: number): void {
  setTimeout(operation, delay);
}

// 8. 랜덤 값 생성 함수 (Math.random 모킹을 위한 함수)
export function generateUserId(): number {
  return Math.floor(Math.random() * 1000000);
}

// 9. 현재 시간 함수 (Date 모킹을 위한 함수)
export function getCurrentTimestamp(): number {
  return Date.now();
}

// 10. 외부 모듈 의존성이 있는 함수
export function formatUserData(user: User): string {
  return JSON.stringify(user, null, 2);
}
