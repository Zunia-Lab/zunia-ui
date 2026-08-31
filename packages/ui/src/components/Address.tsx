export interface AddressProps {
  value: string;
  /** Characters kept on each side when truncated. Default 6. */
  keep?: number;
  className?: string;
  title?: string;
}

export function truncateAddress(value: string, keep = 6): string {
  if (value.length <= keep * 2 + 1) return value;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

export function Address({ value, keep = 6, className = "", title }: AddressProps) {
  return (
    <span className={`zunia-address ${className}`.trim()} title={title ?? value}>
      {truncateAddress(value, keep)}
    </span>
  );
}
