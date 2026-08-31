import type { HTMLAttributes, ReactNode } from "react";

export type TextVariant = "title" | "body" | "label";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  children: ReactNode;
  as?: "p" | "h1" | "h2" | "h3" | "span";
}

export function Text({
  variant = "body",
  as,
  className = "",
  children,
  ...rest
}: TextProps) {
  const Tag = as ?? (variant === "title" ? "h2" : "p");
  return (
    <Tag className={`zunia-text--${variant} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
