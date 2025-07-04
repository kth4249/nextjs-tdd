// Jest 설정 파일 - NextJS 환경에서 TypeScript와 React Testing Library를 사용하기 위한 설정
const nextJest = require("next/jest");

// Next.js 앱의 설정을 자동으로 로드하는 Jest 설정 생성
const createJestConfig = nextJest({
  // Next.js 앱의 디렉토리 설정 (package.json과 next.config.js가 있는 위치)
  dir: "./",
});

// Jest에 전달할 커스텀 설정
const customJestConfig = {
  // 테스트 파일 패턴 설정
  testMatch: [
    "<rootDir>/src/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/tests/**/*.{js,jsx,ts,tsx}",
  ],

  // 각 테스트 파일 실행 전에 실행할 setup 파일들
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // 테스트 환경 설정 (React 컴포넌트 테스트를 위해 jsdom 사용)
  testEnvironment: "jsdom",

  // 모듈 매핑 설정 (절대 경로 import와 정적 파일 모킹)
  moduleNameMapping: {
    // Next.js의 기본 절대 경로 매핑
    "^@/(.*)$": "<rootDir>/src/$1",
    // 정적 파일 (이미지, CSS 등) 모킹 설정
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // 테스트 커버리지 설정
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/app/globals.css",
  ],

  // 테스트 파일에서 사용할 전역 변수 설정
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },

  // 테스트 실행 전 변환 설정
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};

// Next.js 설정과 커스텀 설정을 합쳐서 내보내기
module.exports = createJestConfig(customJestConfig);
