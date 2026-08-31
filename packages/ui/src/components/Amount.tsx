export interface AmountProps {
  value: string | number;
  denom?: string;
  className?: string;
}

export function Amount({ value, denom, className = "" }: AmountProps) {
  return (
    <span className={`zunia-amount ${className}`.trim()}>
      {value}
      {denom ? <span className="zunia-amount__denom">{denom}</span> : null}
    </span>
  );
}
