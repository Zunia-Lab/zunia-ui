import type { HTMLAttributes, ReactNode } from "react";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Interaction container — use for lists, forms, and actionable panels. */
export function Surface({ children, className = "", ...rest }: SurfaceProps) {
  return (
    <div className={`zunia-surface ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
