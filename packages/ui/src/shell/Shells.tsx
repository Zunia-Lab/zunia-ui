"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";

export function PopupShell({
  children,
  chromeLabel = "zunialab.com",
  className,
  /** Storybook / marketing mock shows a fake URL bar. Real extension popups should hide it. */
  showChrome = true,
}: {
  children: ReactNode;
  chromeLabel?: string;
  className?: string;
  showChrome?: boolean;
}) {
  return (
    <div
      className={cn(
        "box-border flex h-[600px] w-[360px] min-w-[360px] max-w-[360px] flex-col overflow-hidden overflow-x-clip bg-bg text-fg",
        showChrome && "rounded-[16px] border border-[var(--z-line)]",
        className,
      )}
    >
      {showChrome ? (
        <div className="flex items-center gap-2 border-b border-[var(--z-line)] px-3 py-2">
          <span className="flex gap-1">
            <span className="size-2 rounded-full bg-[var(--z-glass-2)]" />
            <span className="size-2 rounded-full bg-[var(--z-glass-2)]" />
            <span className="size-2 rounded-full bg-[var(--z-glass-2)]" />
          </span>
          <span className="font-mono text-[10px] text-fg-dim">{chromeLabel}</span>
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function ScreenScaffold({
  title,
  onBack,
  right,
  children,
  /** Pinned above the scroll area. Replaces the default title row. */
  header,
  /** Pinned below the scroll area, e.g. Back / Continue actions. */
  footer,
  /** Pinned under the title, above the scroll, e.g. a search field. */
  toolbar,
  /** Pinned below the footer, e.g. the root tab bar. Rendered without chrome. */
  bottomBar,
  className,
  contentClassName,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  toolbar?: ReactNode;
  bottomBar?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {header ? (
        <div className="relative z-[2] w-full shrink-0">{header}</div>
      ) : null}
      {!header && (title || onBack || right) && (
        <header className="flex items-center gap-3 px-4 py-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "flex size-[34px] items-center justify-center rounded-[11px] border border-[var(--z-line)] text-fg",
                focusRing,
              )}
              aria-label="Back"
            >
              ←
            </button>
          ) : null}
          {title ? (
            <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-tight text-fg">
              {title}
            </h1>
          ) : (
            <span className="flex-1" />
          )}
          {right}
        </header>
      )}
      {toolbar ? (
        <div className="relative z-[2] w-full shrink-0 border-b border-[var(--z-line)] bg-bg px-4 pb-2.5">
          {toolbar}
        </div>
      ) : null}
      <div
        className={cn(
          "min-h-0 w-full max-w-full flex-1 overflow-x-clip overflow-y-auto",
          contentClassName,
        )}
      >
        <div
          className={cn(
            "box-border w-full px-4",
            footer || bottomBar ? "pb-3" : "pb-4",
          )}
        >
          {children}
        </div>
      </div>
      {footer ? (
        <div
          className={cn(
            "relative z-[2] box-border w-full shrink-0 border-t border-[var(--z-line)] bg-[color-mix(in_srgb,var(--z-bg)_86%,transparent)] px-4 pt-3 backdrop-blur-[12px]",
            bottomBar ? "pb-3" : "pb-4",
          )}
        >
          {footer}
        </div>
      ) : null}
      {bottomBar ? (
        <div className="relative z-[2] w-full shrink-0">{bottomBar}</div>
      ) : null}
    </div>
  );
}

export function TabBar({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: string; label: string; icon?: ReactNode; badge?: boolean }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "mx-3 mb-3 flex items-center justify-between gap-1 rounded-full border border-[var(--z-line)] bg-[color-mix(in_srgb,var(--z-surface)_92%,transparent)] px-2 py-1.5 shadow-[0_14px_30px_var(--z-shadow)] backdrop-blur-[14px]",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative flex items-center rounded-full font-mono text-[9px] uppercase tracking-[0.1em]",
              "transition-[background-color,color,transform] duration-[var(--z-duration-fast)] ease-[var(--z-ease)]",
              active
                ? "gap-1.5 bg-[var(--z-button)] py-1.5 pl-1.5 pr-3 font-semibold text-[var(--z-button-fg)]"
                : "flex-col gap-1 px-2.5 py-1 text-fg-muted hover:bg-[var(--z-state-hover)] hover:text-fg active:bg-[var(--z-state-press)]",
              focusRing,
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center",
                active &&
                  "size-[22px] rounded-full bg-[color-mix(in_srgb,var(--z-button-fg)_22%,transparent)]",
              )}
            >
              {item.icon}
            </span>
            {item.label}
            {item.badge && !active ? (
              <span className="absolute right-1.5 top-0.5 size-1.5 rounded-full bg-accent" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Side panel over the page. Built on the Radix dialog, so it traps focus while
 * open, closes on Escape or a click on the scrim, and gives focus back to
 * whatever opened it.
 */
export function Drawer({
  open,
  onClose,
  children,
  className,
  side = "right",
  title = "Menu",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  /** Accessible name. Visually hidden; the drawer's own content is the visible heading. */
  title?: string;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--z-overlay)]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 z-50 w-[min(320px,calc(100%-24px))] overflow-auto bg-[var(--z-surface-sunken)] p-4 shadow-[0_24px_48px_var(--z-shadow)] outline-none",
            side === "right"
              ? "right-0 rounded-l-[28px]"
              : "left-0 rounded-r-[28px]",
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const railPanel =
  "border border-[var(--z-line)] bg-[image:var(--z-surface-gradient)] shadow-[var(--z-card-shadow)]";

export function AppShell({
  chainRail,
  nav,
  topBar,
  children,
  live,
  framed = false,
  className,
}: {
  chainRail?: ReactNode;
  nav?: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
  live?: ReactNode;
  /** Desktop-window mock (inset, rounded). Default is a full-page dashboard. */
  framed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full overflow-hidden bg-bg text-fg",
        framed &&
          "gap-2.5 rounded-[18px] bg-[var(--z-surface-sunken)] p-2.5 shadow-[0_26px_60px_var(--z-shadow)]",
        className,
      )}
    >
      {chainRail ? (
        <div
          className={cn(
            "hidden w-[72px] shrink-0 flex-col items-center gap-2.5 overflow-y-auto py-3 md:flex",
            railPanel,
            framed && "rounded-[14px]",
          )}
        >
          {chainRail}
        </div>
      ) : null}
      {nav ? (
        <div
          className={cn(
            "hidden w-[var(--z-nav-w)] shrink-0 flex-col p-3 md:flex lg:w-[var(--z-nav-w-lg)]",
            railPanel,
            framed && "rounded-[14px] p-2.5",
          )}
        >
          {nav}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col bg-bg">
        {topBar ? (
          <div className="flex min-h-12 shrink-0 items-center gap-3 border-b border-[var(--z-line)] px-4 py-2.5 sm:gap-3.5 md:min-h-[52px] md:px-6 lg:px-7">
            {topBar}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 md:px-6 md:pb-5 lg:px-8 lg:pb-6">
          {children}
        </div>
      </div>
      {live ? (
        <div
          className={cn(
            // Parent mounts this only on large screens; no breakpoint auto-show here.
            "flex w-[var(--z-live-w)] shrink-0 flex-col overflow-y-auto p-4 xl:w-[var(--z-live-w-xl)]",
            railPanel,
            framed && "rounded-[14px] p-3",
          )}
        >
          {live}
        </div>
      ) : null}
    </div>
  );
}
