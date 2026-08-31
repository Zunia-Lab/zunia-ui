import type { ReactNode } from "react";

export interface ChainBadgeProps {
  name: string;
  iconUrl?: string;
  className?: string;
  trailing?: ReactNode;
}

export function ChainBadge({ name, iconUrl, className = "", trailing }: ChainBadgeProps) {
  return (
    <span className={`zunia-badge ${className}`.trim()}>
      {iconUrl ? (
        <img className="zunia-badge__icon" src={iconUrl} alt="" width={20} height={20} />
      ) : (
        <span className="zunia-badge__icon" aria-hidden />
      )}
      {name}
      {trailing}
    </span>
  );
}
