"use client";

import {
  useCallback,
  useMemo,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn, focusRing } from "../lib/cn";

/**
 * Hardened mnemonic entry:
 * - never logs values
 * - paste distributes words across cells
 * - autocomplete/off, spellCheck off, autocapitalize off
 * - optional BIP39 wordlist validation (caller supplies set)
 */
export function MnemonicInput({
  length = 12,
  value,
  onChange,
  wordlist,
  className,
  disabled,
}: {
  length?: 12 | 24;
  value: string[];
  onChange: (words: string[]) => void;
  /** Optional lowercase BIP39 word set for per-cell validity */
  wordlist?: ReadonlySet<string>;
  className?: string;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const words = useMemo(() => {
    const next = value.slice(0, length);
    while (next.length < length) next.push("");
    return next;
  }, [value, length]);

  const setAt = useCallback(
    (index: number, raw: string) => {
      const cleaned = raw.toLowerCase().replace(/[^a-z]/g, "");
      const next = [...words];
      next[index] = cleaned;
      onChange(next);
    },
    [words, onChange],
  );

  const onPaste = (e: ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const parts = text
      .trim()
      .toLowerCase()
      .split(/[\s,]+/)
      .map((w) => w.replace(/[^a-z]/g, ""))
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...words];
    for (let i = 0; i < parts.length && startIndex + i < length; i++) {
      next[startIndex + i] = parts[i]!;
    }
    onChange(next);
    const focusIdx = Math.min(startIndex + parts.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !words[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === " " || e.key === "Enter" || e.key === "Tab") {
      if (e.key === " " || e.key === "Enter") e.preventDefault();
      if (words[index] && index < length - 1) {
        refs.current[index + 1]?.focus();
      }
    }
  };

  return (
    <ol
      className={cn(
        "grid gap-2",
        length === 12 ? "grid-cols-3" : "grid-cols-4",
        className,
      )}
      onCopy={(e) => {
        // Discourage accidental copy of seed material from the form itself.
        e.preventDefault();
      }}
    >
      {words.map((word, i) => {
        const invalid =
          Boolean(wordlist) && word.length > 0 && !wordlist!.has(word);
        return (
          <li key={i} className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9.5px] text-fg-faint">
              {i + 1}
            </span>
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              disabled={disabled}
              aria-label={`Word ${i + 1}`}
              aria-invalid={invalid || undefined}
              value={word}
              onChange={(e) => setAt(i, e.target.value)}
              onPaste={(e) => onPaste(e, i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "w-full rounded-[12px] border bg-[var(--z-glass)] py-2.5 pl-7 pr-2",
                "font-mono text-[12px] text-fg",
                invalid
                  ? "border-[var(--z-danger-line)] bg-[var(--z-danger-fill)]"
                  : "border-[var(--z-line)]",
                focusRing,
              )}
            />
          </li>
        );
      })}
    </ol>
  );
}
