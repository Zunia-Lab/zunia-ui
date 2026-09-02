"use client";

import { cn } from "../lib/cn";
import { Progress, SectionLabel } from "../primitives/Feedback";

export type PasswordStrength = "empty" | "weak" | "fair" | "strong";

export function scorePassword(password: string): {
  score: PasswordStrength;
  pct: number;
  hints: string[];
} {
  if (!password) return { score: "empty", pct: 0, hints: ["Enter a password"] };
  const hints: string[] = [];
  let points = 0;
  if (password.length >= 8) points += 1;
  else hints.push("Use at least 8 characters");
  if (password.length >= 12) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  else hints.push("Mix upper and lower case");
  if (/\d/.test(password)) points += 1;
  else hints.push("Add a number");
  if (/[^A-Za-z0-9]/.test(password)) points += 1;
  else hints.push("Add a symbol");

  if (points <= 1) return { score: "weak", pct: 25, hints };
  if (points <= 3) return { score: "fair", pct: 55, hints };
  return { score: "strong", pct: 100, hints: hints.length ? hints : ["Looks good"] };
}

export function PasswordStrengthMeter({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  const { score, pct, hints } = scorePassword(password);
  const label =
    score === "empty"
      ? "Strength"
      : score === "weak"
        ? "Weak"
        : score === "fair"
          ? "Fair"
          : "Strong";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <SectionLabel>Password strength</SectionLabel>
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-wider",
            score === "strong" && "text-[var(--z-success)]",
            score === "weak" && "text-[var(--z-danger)]",
            (score === "fair" || score === "empty") && "text-fg-muted",
          )}
        >
          {label}
        </span>
      </div>
      <Progress value={pct} />
      <ul className="font-mono text-[10px] text-fg-dim">
        {hints.slice(0, 2).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </div>
  );
}
