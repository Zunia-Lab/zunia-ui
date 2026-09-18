"use client";

import type { ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";
import { Button } from "../primitives/Button";
import {
  Callout,
  EmptyState,
  KeyValueRow,
  SectionLabel,
  Spinner,
} from "../primitives/Feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  SheetContent,
} from "../primitives/Dialog";
import { Avatar } from "../primitives/WalletAvatar";
import { AddressChip, Amount, ChainBadge } from "./Display";
import {
  FeeSummary,
  MessageDecodeList,
  ProgressTracker,
  QrFrame,
  SigningRequest,
} from "./Flows";

export function ConfirmTransfer({
  title = "Confirm transfer",
  from,
  to,
  amount,
  denom,
  chainLabel,
  fees,
  warning,
  loading,
  onCancel,
  onConfirm,
  className,
}: {
  title?: string;
  from: string;
  to: string;
  amount: string;
  denom: string;
  chainLabel?: string;
  fees: { label: string; value: string; accent?: boolean }[];
  warning?: string;
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <SectionLabel>{title}</SectionLabel>
      <div className="rounded-[16px] border border-[var(--z-line)] bg-[var(--z-glass)] p-4">
        <div className="flex items-center justify-between gap-3">
          <Amount value={amount} denom={denom} size="lg" />
          {chainLabel ? <ChainBadge name={chainLabel} /> : null}
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <KeyValueRow label="From" value={<AddressChip address={from} />} />
          <KeyValueRow label="To" value={<AddressChip address={to} />} />
        </div>
      </div>
      <FeeSummary rows={fees} />
      {warning ? <Callout tone="warning">{warning}</Callout> : null}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button className="flex-[1.4]" onClick={onConfirm} disabled={loading}>
          {loading ? "Signing…" : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

export function ApproveSession({
  dappName,
  dappUrl,
  iconUrl,
  chains,
  permissions,
  loading,
  onReject,
  onApprove,
  className,
}: {
  dappName: string;
  dappUrl: string;
  iconUrl?: string;
  chains: string[];
  permissions: string[];
  loading?: boolean;
  onReject?: () => void;
  onApprove?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <SectionLabel>Connect request</SectionLabel>
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-[var(--z-glass-2)]">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" className="size-full object-cover" />
          ) : (
            <Avatar seed={dappName} size={44} />
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-fg">{dappName}</div>
          <div className="truncate font-mono text-[11px] text-fg-muted">{dappUrl}</div>
        </div>
      </div>
      <div>
        <SectionLabel>Networks</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chains.map((c) => (
            <ChainBadge key={c} name={c} />
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Permissions</SectionLabel>
        <ul className="mt-2 flex flex-col gap-1.5 font-mono text-[11px] text-fg-muted">
          {permissions.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onReject} disabled={loading}>
          Reject
        </Button>
        <Button className="flex-[1.4]" onClick={onApprove} disabled={loading}>
          {loading ? "Connecting…" : "Connect"}
        </Button>
      </div>
    </div>
  );
}

export function AccountSwitcher({
  accounts,
  activeAddress,
  onSelect,
  onAdd,
  className,
}: {
  accounts: { address: string; name: string; chainLabel?: string }[];
  activeAddress?: string;
  onSelect: (address: string) => void;
  onAdd?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <SectionLabel>Accounts</SectionLabel>
      {accounts.length === 0 ? (
        <EmptyState title="No accounts" description="Create or import a wallet." />
      ) : (
        accounts.map((a) => {
          const selected = a.address === activeAddress;
          return (
            <button
              key={a.address}
              type="button"
              data-selected={selected || undefined}
              onClick={() => onSelect(a.address)}
              className={cn(
                "flex items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition-colors",
                selected
                  ? "border-fg bg-[var(--z-state-selected)] shadow-[inset_2px_0_0_var(--z-accent)]"
                  : "border-[var(--z-line)] hover:bg-[var(--z-state-hover)]",
                focusRing,
              )}
            >
              <Avatar seed={a.address} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-fg">{a.name}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-fg-muted">
                  <AddressChip address={a.address} />
                </span>
              </span>
              {a.chainLabel ? <ChainBadge name={a.chainLabel} /> : null}
            </button>
          );
        })
      )}
      {onAdd ? (
        <Button variant="secondary" onClick={onAdd}>
          Add account
        </Button>
      ) : null}
    </div>
  );
}

export function NetworkPickerSheet({
  networks,
  activeChainId,
  onSelect,
  search,
  onSearchChange,
  className,
}: {
  networks: { chainId: string; name: string; symbol?: string }[];
  activeChainId?: string;
  onSelect: (chainId: string) => void;
  search?: string;
  onSearchChange?: (q: string) => void;
  className?: string;
}) {
  const q = (search ?? "").toLowerCase();
  const filtered = q
    ? networks.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.chainId.toLowerCase().includes(q) ||
          (n.symbol ?? "").toLowerCase().includes(q),
      )
    : networks;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <SectionLabel>Networks</SectionLabel>
      {onSearchChange ? (
        <input
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search networks"
          className="h-10 rounded-[12px] border border-[var(--z-line)] bg-[var(--z-glass)] px-3 text-[13px] text-fg outline-none focus:border-fg"
        />
      ) : null}
      <div className="flex max-h-[320px] flex-col gap-1.5 overflow-y-auto">
        {filtered.map((n) => {
          const selected = n.chainId === activeChainId;
          return (
            <button
              key={n.chainId}
              type="button"
              onClick={() => onSelect(n.chainId)}
              className={cn(
                "flex items-center justify-between rounded-[12px] border px-3 py-2.5 text-left",
                selected
                  ? "border-fg bg-[var(--z-state-selected)]"
                  : "border-[var(--z-line)] hover:bg-[var(--z-state-hover)]",
                focusRing,
              )}
            >
              <span>
                <span className="block text-[13px] font-medium">{n.name}</span>
                <span className="font-mono text-[10px] text-fg-muted">{n.chainId}</span>
              </span>
              {n.symbol ? (
                <span className="font-mono text-[11px] text-fg-muted">{n.symbol}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TxDetail({
  hash,
  status,
  chainLabel,
  messages,
  fees,
  explorerUrl,
  className,
}: {
  hash: string;
  status: "pending" | "success" | "failed";
  chainLabel?: string;
  messages: { type: string; summary: string }[];
  fees?: { label: string; value: string }[];
  explorerUrl?: string;
  className?: string;
}) {
  const tone =
    status === "success" ? "info" : status === "failed" ? "danger" : "warning";
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Transaction</SectionLabel>
        {chainLabel ? <ChainBadge name={chainLabel} /> : null}
      </div>
      <Callout tone={tone}>
        {status === "pending" ? "Pending confirmation" : status === "success" ? "Confirmed" : "Failed"}
      </Callout>
      <KeyValueRow label="Hash" value={<AddressChip address={hash} />} />
      <MessageDecodeList messages={messages} />
      {fees ? <FeeSummary rows={fees} /> : null}
      {explorerUrl ? (
        <Button variant="secondary" asChild>
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        </Button>
      ) : null}
    </div>
  );
}

export function AssetDetail({
  name,
  symbol,
  amount,
  fiat,
  chainLabel,
  actions,
  className,
}: {
  name: string;
  symbol: string;
  amount: string;
  fiat?: string;
  chainLabel?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[18px] font-medium text-fg">{name}</div>
          <div className="mt-1 font-mono text-[11px] text-fg-muted">{symbol}</div>
        </div>
        {chainLabel ? <ChainBadge name={chainLabel} /> : null}
      </div>
      <Amount value={amount} denom={symbol} size="hero" />
      {fiat ? <div className="font-mono text-[12px] text-fg-muted">{fiat}</div> : null}
      {actions}
    </div>
  );
}

export function ValidatorDetail({
  name,
  moniker,
  commission,
  votingPower,
  apr,
  status,
  actions,
  className,
}: {
  name: string;
  moniker?: string;
  commission: string;
  votingPower: string;
  apr?: string;
  status?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div>
        <div className="text-[18px] font-medium text-fg">{name}</div>
        {moniker ? (
          <div className="mt-1 font-mono text-[11px] text-fg-muted">{moniker}</div>
        ) : null}
        {status ? (
          <div className="mt-2 inline-flex rounded-full bg-[var(--z-glass-2)] px-2 py-0.5 font-mono text-[10px] uppercase text-fg-muted">
            {status}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KeyValueRow label="Commission" value={commission} />
        <KeyValueRow label="Voting power" value={votingPower} />
        {apr ? <KeyValueRow label="APR" value={apr} /> : null}
      </div>
      {actions}
    </div>
  );
}

export function TransferSent({
  title = "Transfer sent",
  hash,
  steps,
  step,
  total,
  explorerUrl,
  onDone,
  className,
}: {
  title?: string;
  hash?: string;
  steps: { label: string; state: "done" | "current" | "pending" }[];
  step: number;
  total: number;
  explorerUrl?: string;
  onDone?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ProgressTracker title={title} step={step} total={total} steps={steps} />
      {hash ? <KeyValueRow label="Hash" value={<AddressChip address={hash} />} /> : null}
      <div className="flex gap-2">
        {explorerUrl ? (
          <Button variant="secondary" className="flex-1" asChild>
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              Explorer
            </a>
          </Button>
        ) : null}
        <Button className="flex-1" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function ConnectPairingPanel({
  status,
  qrPayload,
  deepLink,
  statusLabel,
  onCancel,
  className,
}: {
  status: "connecting" | "awaiting_wallet" | "error" | string;
  qrPayload?: string;
  deepLink?: string;
  statusLabel?: string;
  onCancel?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
      <SectionLabel>Connect with Zunia</SectionLabel>
      {status === "awaiting_wallet" || status === "connecting" ? (
        <>
          <QrFrame size={180}>
            {qrPayload ? (
              <span className="break-all p-2 font-mono text-[8px] leading-tight opacity-80">
                {qrPayload.slice(0, 96)}
              </span>
            ) : (
              <Spinner />
            )}
          </QrFrame>
          <p className="max-w-[280px] text-[13px] text-fg-muted">
            {statusLabel ??
              (status === "connecting"
                ? "Preparing secure session…"
                : "Scan with the Zunia mobile app or open the deep link.")}
          </p>
          {deepLink ? (
            <Button variant="secondary" asChild>
              <a href={deepLink}>Open Zunia app</a>
            </Button>
          ) : null}
        </>
      ) : (
        <Callout tone="danger">{statusLabel ?? "Connection failed"}</Callout>
      )}
      {onCancel ? (
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

export function ConfirmTransferDialog({
  open,
  onOpenChange,
  ...props
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & Parameters<typeof ConfirmTransfer>[0]) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Confirm transfer</DialogTitle>
        <DialogDescription className="sr-only">Review and confirm</DialogDescription>
        <ConfirmTransfer {...props} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function ApproveSessionSheet({
  open,
  onOpenChange,
  ...props
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & Parameters<typeof ApproveSession>[0]) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Approve session</DialogTitle>
        <ApproveSession {...props} onReject={() => onOpenChange(false)} />
      </SheetContent>
    </Dialog>
  );
}

/** Re-export SigningRequest as the canonical approve-tx composition. */
export { SigningRequest };
