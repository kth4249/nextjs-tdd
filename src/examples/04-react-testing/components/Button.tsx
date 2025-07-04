/**
 * React 컴포넌트 테스트 학습을 위한 Button 컴포넌트
 * React Testing Library를 사용한 컴포넌트 테스트 예제입니다.
 */

import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  "data-testid"?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "medium",
  loading = false,
  "data-testid": testId,
}) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors";

  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300",
  };

  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          로딩 중...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
