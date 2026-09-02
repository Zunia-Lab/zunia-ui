"use client";

import { cn } from "../lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../primitives/Select";

export type ChainOption = {
  chainId: string;
  name: string;
  symbol?: string;
  iconUrl?: string;
};

export function ChainPicker({
  chains,
  value,
  onChange,
  placeholder = "Select chain",
  disabled,
  className,
}: {
  chains: ChainOption[];
  value?: string;
  onChange: (chainId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label="Chain">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="min-w-[240px]">
          {chains.map((c) => (
            <SelectItem key={c.chainId} value={c.chainId}>
              {c.name}
              {c.symbol ? ` · ${c.symbol}` : ""} ({c.chainId})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
