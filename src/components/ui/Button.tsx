import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) => {
  // 颜色映射 (对应 tailwind.config.js 里的 colors.fairytale)
  const variants = {
    primary: "bg-fairytale-primary text-white hover:bg-red-400",
    secondary: "bg-fairytale-secondary text-fairytale-text hover:bg-green-200",
    accent: "bg-fairytale-accent text-white hover:bg-cyan-400",
    danger: "bg-fairytale-danger text-white hover:bg-red-500",
  };

  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-lg px-8 py-3",
    lg: "text-2xl px-10 py-4",
  };

  return (
    <button
      className={`
        cartoon-button 
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
