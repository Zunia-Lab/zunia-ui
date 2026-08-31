import type { InputHTMLAttributes, ReactNode } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export function TextField({ label, className = "", id, ...rest }: TextFieldProps) {
  const inputId = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="zunia-field">
      {label ? (
        <label className="zunia-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={`zunia-input ${className}`.trim()} {...rest} />
    </div>
  );
}
