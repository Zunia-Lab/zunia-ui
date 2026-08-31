import type { HTMLAttributes, ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  theme?: ThemeMode;
  children: ReactNode;
}

export function ThemeProvider({
  theme = "dark",
  children,
  className = "",
  ...rest
}: ThemeProviderProps) {
  return (
    <div
      className={`zunia-root ${className}`.trim()}
      data-theme={theme}
      {...rest}
    >
      {children}
    </div>
  );
}
