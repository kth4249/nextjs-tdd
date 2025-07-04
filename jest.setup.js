// Jest 환경 설정 파일 - 모든 테스트 파일 실행 전에 실행됩니다.

// React Testing Library의 추가적인 매처들을 Jest에 추가
// 예: toBeInTheDocument(), toHaveClass() 등의 DOM 관련 매처들
import "@testing-library/jest-dom";

// 전역 모킹 설정
// Next.js의 useRouter를 모킹 (테스트 환경에서 라우터 기능 시뮬레이션)
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// 웹 API 모킹 (테스트 환경에서 브라우저 API 시뮬레이션)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 콘솔 에러 필터링 (테스트 중 불필요한 에러 로그 숨기기)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 테스트 타임아웃 설정 (기본 5초에서 10초로 증가)
jest.setTimeout(10000);
