import type { ImgHTMLAttributes } from "react";

const DEFAULT_MARK =
  "https://raw.githubusercontent.com/Zunia-Lab/zunia-brand/v1.0.0/png/icons/zunia-icon-cobalt-128.png";

export interface MarkProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

export function Mark({ size = 32, className = "", alt = "Zunia", src, ...rest }: MarkProps) {
  return (
    <img
      className={`zunia-mark ${className}`.trim()}
      src={src ?? DEFAULT_MARK}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      {...rest}
    />
  );
}
