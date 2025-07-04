/**
 * React 컴포넌트 테스트 학습을 위한 Jest 테스트 파일
 * React Testing Library를 사용한 컴포넌트 테스트 예제입니다.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, jest } from "@jest/globals";
import { Button, ButtonProps } from "./Button";

// 1. 기본 렌더링 테스트
describe("Button 컴포넌트 기본 렌더링", () => {
  test("기본 버튼이 렌더링됩니다", () => {
    render(<Button>클릭하세요</Button>);

    // 텍스트로 요소 찾기
    const button = screen.getByText("클릭하세요");
    expect(button).toBeInTheDocument();

    // 버튼 태그인지 확인
    expect(button.tagName).toBe("BUTTON");
  });

  test("data-testid로 버튼을 찾을 수 있습니다", () => {
    render(<Button data-testid="submit-button">제출</Button>);

    // data-testid로 요소 찾기
    const button = screen.getByTestId("submit-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("제출");
  });

  test("role로 버튼을 찾을 수 있습니다", () => {
    render(<Button>버튼</Button>);

    // role로 요소 찾기
    const button = screen.getByRole("button", { name: "버튼" });
    expect(button).toBeInTheDocument();
  });
});

// 2. Props 테스트
describe("Button 컴포넌트 Props 테스트", () => {
  test("disabled 상태가 올바르게 적용됩니다", () => {
    render(<Button disabled>비활성 버튼</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  test("기본적으로 활성 상태입니다", () => {
    render(<Button>활성 버튼</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeEnabled();
  });

  test("variant에 따른 CSS 클래스가 적용됩니다", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);

    let button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-500");

    // 다른 variant로 재렌더링
    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("bg-red-500");

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-200");
  });

  test("size에 따른 CSS 클래스가 적용됩니다", () => {
    const { rerender } = render(<Button size="small">Small</Button>);

    let button = screen.getByRole("button");
    expect(button).toHaveClass("px-2 py-1 text-sm");

    rerender(<Button size="medium">Medium</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("px-4 py-2 text-base");

    rerender(<Button size="large">Large</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("px-6 py-3 text-lg");
  });
});

// 3. 이벤트 핸들링 테스트
describe("Button 컴포넌트 이벤트 테스트", () => {
  test("클릭 이벤트가 올바르게 호출됩니다", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭 테스트</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // 클릭 이벤트가 한 번 호출되었는지 확인
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("비활성 상태에서는 클릭 이벤트가 호출되지 않습니다", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        비활성 버튼
      </Button>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // 클릭 이벤트가 호출되지 않았는지 확인
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("여러 번 클릭 시 이벤트가 여러 번 호출됩니다", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>다중 클릭</Button>);

    const button = screen.getByRole("button");

    // 3번 클릭
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});

// 4. userEvent를 사용한 더 실제적인 이벤트 테스트
describe("Button 컴포넌트 userEvent 테스트", () => {
  test("userEvent.click을 사용한 클릭 테스트", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>User Event 테스트</Button>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("키보드 네비게이션 테스트", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <div>
        <Button onClick={handleClick}>첫 번째 버튼</Button>
        <Button>두 번째 버튼</Button>
      </div>
    );

    // Tab 키로 버튼에 포커스
    await user.tab();

    const firstButton = screen.getByText("첫 번째 버튼");
    expect(firstButton).toHaveFocus();

    // Enter 키로 버튼 클릭
    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Tab 키로 다음 버튼으로 이동
    await user.tab();

    const secondButton = screen.getByText("두 번째 버튼");
    expect(secondButton).toHaveFocus();
  });
});

// 5. 로딩 상태 테스트
describe("Button 컴포넌트 로딩 상태 테스트", () => {
  test("로딩 상태에서 올바른 텍스트가 표시됩니다", () => {
    render(<Button loading>제출 중</Button>);

    // 로딩 텍스트가 표시되는지 확인
    expect(screen.getByText("로딩 중...")).toBeInTheDocument();

    // 원래 텍스트는 표시되지 않음
    expect(screen.queryByText("제출 중")).not.toBeInTheDocument();
  });

  test("로딩 상태에서 버튼이 비활성화됩니다", () => {
    render(<Button loading>로딩 버튼</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  test("로딩 상태에서 클릭 이벤트가 호출되지 않습니다", () => {
    const handleClick = jest.fn();
    render(
      <Button loading onClick={handleClick}>
        로딩 버튼
      </Button>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test("로딩 스피너가 표시됩니다", () => {
    render(<Button loading>로딩 버튼</Button>);

    // SVG 요소 (스피너)가 있는지 확인
    const spinner = screen.getByText("로딩 중...").querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });
});

// 6. 조건부 렌더링 테스트
describe("Button 컴포넌트 조건부 렌더링 테스트", () => {
  test("children이 React 요소인 경우", () => {
    render(
      <Button>
        <span data-testid="icon">🚀</span>
        <span>실행</span>
      </Button>
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("실행")).toBeInTheDocument();
  });

  test("children이 문자열인 경우", () => {
    render(<Button>간단한 텍스트</Button>);

    expect(screen.getByText("간단한 텍스트")).toBeInTheDocument();
  });
});

// 7. 스냅샷 테스트
describe("Button 컴포넌트 스냅샷 테스트", () => {
  test("기본 버튼 스냅샷", () => {
    const { container } = render(<Button>스냅샷 테스트</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("모든 props가 적용된 버튼 스냅샷", () => {
    const { container } = render(
      <Button
        variant="danger"
        size="large"
        disabled
        data-testid="complex-button"
      >
        복잡한 버튼
      </Button>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

// 8. 접근성 테스트
describe("Button 컴포넌트 접근성 테스트", () => {
  test("버튼은 적절한 role을 가집니다", () => {
    render(<Button>접근성 테스트</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  test("비활성 버튼은 aria-disabled 속성을 가집니다", () => {
    render(<Button disabled>비활성 버튼</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("disabled");
  });

  test("버튼은 키보드로 접근 가능합니다", () => {
    render(<Button>키보드 접근</Button>);

    const button = screen.getByRole("button");

    // 버튼이 탭 인덱스를 가지는지 확인 (기본적으로 버튼은 포커스 가능)
    button.focus();
    expect(button).toHaveFocus();
  });
});

// 9. 에러 바운더리 테스트
describe("Button 컴포넌트 에러 처리 테스트", () => {
  // 에러 바운더리 컴포넌트
  class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return <div>Something went wrong.</div>;
      }

      return this.props.children;
    }
  }

  test("잘못된 props가 전달되어도 에러가 발생하지 않습니다", () => {
    // 콘솔 에러 억제
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Button variant={"invalid" as any}>잘못된 variant</Button>
      </ErrorBoundary>
    );

    // 컴포넌트가 여전히 렌더링되는지 확인
    expect(screen.getByText("잘못된 variant")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

// 10. 성능 테스트
describe("Button 컴포넌트 성능 테스트", () => {
  test("많은 수의 버튼이 빠르게 렌더링됩니다", () => {
    const startTime = performance.now();

    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <Button key={i}>버튼 {i}</Button>
        ))}
      </div>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 100개의 버튼이 100ms 이내에 렌더링되어야 함
    expect(renderTime).toBeLessThan(100);

    // 모든 버튼이 렌더링되었는지 확인
    expect(screen.getAllByRole("button")).toHaveLength(100);
  });
});
