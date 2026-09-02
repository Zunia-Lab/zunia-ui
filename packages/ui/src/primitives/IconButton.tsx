"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";
import { Button } from "./Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  variant?: "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function IconButton({
  label,
  children,
  variant = "secondary",
  size = "md",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        size === "sm" && "h-9 w-9 [&_svg]:size-4",
        size === "md" && "h-11 w-11 [&_svg]:size-[18px]",
        className,
        focusRing,
      )}
      aria-label={label}
      {...rest}
    >
      {children}
    </Button>
  );
}
