"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn, focusRing, interactiveBordered } from "../lib/cn";
import { Button } from "../primitives/Button";
import { Checkbox } from "../primitives/Checkbox";
import {
  Callout,
  EmptyState,
  SectionLabel,
  Skeleton,
} from "../primitives/Feedback";
import { truncateAddress } from "../wallet/Display";
import {
  NFT_MEDIA_LOAD_LABEL,
  NFT_MEDIA_PRIVACY_NOTE,
  nftPlaceholder,
  nftTitle,
  type NftMediaState,
} from "./nftMedia";

/* -------------------------------------------------------------------------- *
 * Media frame
 * -------------------------------------------------------------------------- */

export interface NftMediaProps {
  /** Seeds the placeholder art; also used for the monogram. */
  readonly tokenId: string;
  /** Resolved http(s) URL. Resolving `ipfs://` to a gateway is the host's job. */
  readonly imageUrl?: string | null;
  /**
   * Fetch the artwork.
   *
   * Defaults to **false**. Turning it on makes the user's device contact the
   * host named in the token, which learns their IP address and which tokens
   * they hold. See `NFT_MEDIA_PRIVACY_NOTE`.
   */
  readonly loadMedia?: boolean;
  /** Rendered as a button over the placeholder when media is off. */
  readonly onRequestMedia?: () => void;
  readonly alt?: string;
  readonly className?: string;
  /** Square by default; pass `false` inside a fixed-height frame. */
  readonly square?: boolean;
}

/**
 * Art frame with a deterministic fallback.
 *
 * The placeholder is always painted underneath, so a slow, blocked, missing or
 * malformed image degrades to a coloured tile with the token's monogram and
 * never to the browser's broken-image glyph. The `<img>` is only mounted when
 * `loadMedia` is true, which is what makes the privacy switch real rather than
 * cosmetic — a hidden image element still issues the request.
 */
/**
 * Chrome painted over the artwork.
 *
 * Fixed dark scrim and fixed light text, in both themes, because what sits
 * underneath is a stranger's image and not a Zunia surface. Following the theme
 * here put ink-on-dark-art at 1.15:1 in the light theme. Brand paper over brand
 * void at 85% measures 12.31:1 against the worst placeholder palette colour showing
 * through, and higher against anything darker.
 */
const MEDIA_SCRIM =
  "bg-[color-mix(in_srgb,var(--z-brand-void)_85%,transparent)] text-[var(--z-brand-paper)]";

export function NftMedia({
  tokenId,
  imageUrl,
  loadMedia = false,
  onRequestMedia,
  alt,
  className,
  square = true,
}: NftMediaProps) {
  const [state, setState] = useState<NftMediaState>("off");
  const placeholder = nftPlaceholder(tokenId);

  useEffect(() => {
    if (!loadMedia) {
      setState("off");
      return;
    }
    setState(imageUrl ? "loading" : "absent");
  }, [loadMedia, imageUrl]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[12px]",
        square && "aspect-square",
        className,
      )}
      style={{
        background: `linear-gradient(150deg, ${placeholder.from}, ${placeholder.to})`,
        // Own the container query rather than trusting an ancestor to declare
        // one: without a container, `cqw` resolves against the viewport and the
        // monogram is drawn at poster size.
        containerType: "inline-size",
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[clamp(18px,18cqw,44px)] font-bold text-[color:var(--nft-monogram)] mix-blend-luminosity"
        style={{ "--nft-monogram": placeholder.accent } as React.CSSProperties}
        aria-hidden
      >
        {placeholder.monogram}
      </span>

      {loadMedia && imageUrl ? (
        <img
          src={imageUrl}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-[var(--z-duration-slow)]",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}

      {state === "loading" ? (
        <span className={cn("absolute inset-x-0 bottom-0 px-2 py-1 text-center font-mono text-[length:var(--z-type-micro)]", MEDIA_SCRIM)}>
          Loading…
        </span>
      ) : null}

      {state === "error" ? (
        <span className={cn("absolute inset-x-0 bottom-0 px-2 py-1 text-center font-mono text-[length:var(--z-type-micro)]", MEDIA_SCRIM)}>
          Artwork unavailable
        </span>
      ) : null}

      {state === "absent" ? (
        <span className={cn("absolute inset-x-0 bottom-0 px-2 py-1 text-center font-mono text-[length:var(--z-type-micro)]", MEDIA_SCRIM)}>
          No artwork on this token
        </span>
      ) : null}

      {state === "off" && onRequestMedia ? (
        // A full-width bar rather than an inset pill: a card can be ~116px wide
        // in a two-column grid on a 320px viewport, where an inset button with
        // a real label overflows. It also matches the loading and error
        // captions, so the frame speaks one language.
        <button
          type="button"
          onClick={(e) => {
            // The card around this is often clickable; loading art is its own
            // decision and must not also open the detail view.
            e.stopPropagation();
            onRequestMedia();
          }}
          className={cn(
            "absolute inset-x-0 bottom-0 h-9 truncate px-2",
            "font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider",
            MEDIA_SCRIM,
            focusRing,
          )}
          title={NFT_MEDIA_PRIVACY_NOTE}
        >
          {NFT_MEDIA_LOAD_LABEL}
        </button>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Card
 * -------------------------------------------------------------------------- */

/**
 * One token, shaped like `NftToken` in `@zunialab/interchain` plus the display
 * extras a client resolves (collection name, gateway-resolved image URL).
 */
export interface NftCardItem {
  readonly tokenId: string;
  readonly name?: string | null;
  readonly collectionAddress?: string;
  readonly collectionName?: string | null;
  readonly chainId?: string;
  /** Already resolved to something a browser can fetch. */
  readonly imageUrl?: string | null;
}

export interface NftCardProps extends NftCardItem {
  /** See {@link NftMediaProps.loadMedia}. Off by default. */
  readonly loadMedia?: boolean;
  readonly onRequestMedia?: () => void;
  readonly onClick?: () => void;
  readonly selected?: boolean;
  /** Corner slot, e.g. a "listed" or "in transit" pill. */
  readonly badge?: ReactNode;
  readonly className?: string;
}

export function NftCard({
  tokenId,
  name,
  collectionAddress,
  collectionName,
  chainId,
  imageUrl,
  loadMedia = false,
  onRequestMedia,
  onClick,
  selected = false,
  badge,
  className,
}: NftCardProps) {
  const title = nftTitle(tokenId, name);
  const collection =
    collectionName?.trim() ||
    (collectionAddress ? truncateAddress(collectionAddress, 6, 4) : null);

  const body = (
    <>
      <div className="relative">
        <NftMedia
          tokenId={tokenId}
          imageUrl={imageUrl}
          loadMedia={loadMedia}
          onRequestMedia={onRequestMedia}
          alt={`${title}${collection ? ` from ${collection}` : ""}`}
        />
        {badge ? <span className="absolute left-1.5 top-1.5">{badge}</span> : null}
      </div>
      <div className="mt-2 min-w-0">
        <div className="truncate text-[length:var(--z-type-row)] font-medium text-fg">
          {title}
        </div>
        <div className="mt-0.5 flex min-w-0 items-baseline justify-between gap-2">
          <span className="min-w-0 truncate font-mono text-[length:var(--z-type-micro)] text-fg-muted">
            {collection ?? "Unknown collection"}
          </span>
          <span className="shrink-0 font-mono text-[length:var(--z-type-micro)] text-fg-dim">
            #{tokenId.length > 8 ? `${tokenId.slice(0, 8)}…` : tokenId}
          </span>
        </div>
        {chainId ? (
          <div className="mt-0.5 truncate font-mono text-[length:var(--z-type-micro)] text-fg-dim">
            {chainId}
          </div>
        ) : null}
      </div>
    </>
  );

  const shell = cn(
    "min-w-0 rounded-[14px] border p-2 text-left",
    selected
      ? "border-[var(--z-accent)] bg-[var(--z-state-selected)]"
      : "border-[var(--z-line)] bg-[var(--z-glass)]",
    className,
  );

  if (!onClick) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected || undefined}
      className={cn(shell, interactiveBordered, focusRing)}
    >
      {body}
    </button>
  );
}

/* -------------------------------------------------------------------------- *
 * Grid
 * -------------------------------------------------------------------------- */

export interface NftGridProps {
  readonly items: readonly NftCardItem[];
  /** Off by default; applies to every card. */
  readonly loadMedia?: boolean;
  readonly onRequestMedia?: (item: NftCardItem) => void;
  /** Turn media on for the whole grid. Rendered as a labelled control. */
  readonly onToggleMedia?: (next: boolean) => void;
  readonly onSelect?: (item: NftCardItem) => void;
  readonly selectedTokenId?: string | null;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly onRetry?: () => void;
  /**
   * The chain cannot hold CW721 tokens (no `cosmwasm` in its registry
   * features). Pass the reason and the grid explains instead of showing an
   * empty state that looks like "you own nothing".
   */
  readonly unsupportedReason?: string | null;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  /** Narrowest a card may get. Default 132px keeps 2 columns at 320dp. */
  readonly minItemWidth?: number;
  readonly className?: string;
  readonly title?: string | null;
}

/**
 * Responsive gallery of {@link NftCard}s.
 *
 * `unsupportedReason` is deliberately separate from `error` and from the empty
 * state: "this chain has no CosmWasm, so there can be no NFTs here" is a
 * different sentence from "you hold none" and from "we could not read". Only
 * 118 of the 332 registry chains declare `cosmwasm`, so this branch is the
 * common one, not an edge case.
 */
export function NftGrid({
  items,
  loadMedia = false,
  onRequestMedia,
  onToggleMedia,
  onSelect,
  selectedTokenId,
  loading = false,
  error,
  onRetry,
  unsupportedReason,
  emptyTitle = "No NFTs here",
  emptyDescription = "Nothing owned by this address on this chain.",
  minItemWidth = 132,
  className,
  title = null,
}: NftGridProps) {
  const header =
    title || onToggleMedia ? (
      <div className="flex flex-wrap items-center justify-between gap-2">
        {title ? <SectionLabel>{title}</SectionLabel> : <span />}
        {onToggleMedia ? (
          <Checkbox
            checked={loadMedia}
            onCheckedChange={(next) => onToggleMedia(next === true)}
            label={
              <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
                Show artwork
              </span>
            }
          />
        ) : null}
      </div>
    ) : null;

  const mediaNote =
    onToggleMedia && !loadMedia ? (
      <p className="m-0 text-[length:var(--z-type-micro)] leading-relaxed text-fg-muted">
        {NFT_MEDIA_PRIVACY_NOTE}
      </p>
    ) : null;

  if (unsupportedReason) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {header}
        <Callout tone="neutral" title="NFTs are not available on this chain">
          {unsupportedReason}
        </Callout>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {header}
        <Callout tone="danger" title="Could not read this collection">
          {error}
        </Callout>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry} className="self-start">
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
  };

  if (loading && items.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)} aria-busy="true">
        {header}
        <span className="sr-only">Loading NFTs</span>
        <div className="grid gap-2" style={gridStyle}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[var(--z-line)] p-2"
            >
              <Skeleton className="aspect-square h-auto w-full rounded-[12px]" />
              <Skeleton className="mt-2 h-2.5 w-2/3" />
              <Skeleton className="mt-1.5 h-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {header}
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {header}
      {mediaNote}
      <div className="grid min-w-0 gap-2" style={gridStyle}>
        {items.map((item) => (
          <NftCard
            key={`${item.collectionAddress ?? "c"}-${item.tokenId}`}
            {...item}
            loadMedia={loadMedia}
            selected={selectedTokenId === item.tokenId}
            onRequestMedia={
              onRequestMedia ? () => onRequestMedia(item) : undefined
            }
            onClick={onSelect ? () => onSelect(item) : undefined}
          />
        ))}
      </div>
      {loading ? (
        <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-dim">
          Loading more…
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Detail
 * -------------------------------------------------------------------------- */

/** Mirrors `NftAttribute` in `@zunialab/interchain`. */
export interface NftTrait {
  readonly traitType: string;
  readonly value: string;
  readonly displayType?: string | null;
}

export interface NftDetailProps extends NftCardItem {
  readonly description?: string | null;
  readonly owner?: string | null;
  readonly traits?: readonly NftTrait[];
  readonly loadMedia?: boolean;
  readonly onRequestMedia?: () => void;
  /** Raw `token_uri`, shown so the user can see where art would come from. */
  readonly tokenUri?: string | null;
  readonly loading?: boolean;
  readonly error?: string | null;
  /** Buttons: transfer, send cross-chain. Disable them with their own reasons. */
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function NftDetail({
  tokenId,
  name,
  collectionAddress,
  collectionName,
  chainId,
  imageUrl,
  description,
  owner,
  traits,
  loadMedia = false,
  onRequestMedia,
  tokenUri,
  loading = false,
  error,
  actions,
  className,
}: NftDetailProps) {
  const title = nftTitle(tokenId, name);

  if (error) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <Callout tone="danger" title="Could not load this token">
          {error}
        </Callout>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-4", className)}>
      <NftMedia
        tokenId={tokenId}
        imageUrl={imageUrl}
        loadMedia={loadMedia}
        onRequestMedia={onRequestMedia}
        alt={title}
      />

      <div className="min-w-0">
        <div className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
          {collectionName?.trim() ||
            (collectionAddress
              ? truncateAddress(collectionAddress, 8, 6)
              : "Unknown collection")}
        </div>
        <h2 className="m-0 mt-1 text-[length:var(--z-type-stat)] font-medium tracking-tight text-fg">
          {title}
        </h2>
        <div className="mt-1 font-mono text-[length:var(--z-type-meta)] text-fg-dim">
          Token {tokenId}
          {chainId ? ` · ${chainId}` : ""}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Loading token details</span>
          <Skeleton className="h-2.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      ) : null}

      {description ? (
        <p className="m-0 text-[length:var(--z-type-body)] leading-relaxed text-fg-muted">
          {description}
        </p>
      ) : null}

      {owner ? (
        <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[var(--z-glass)] px-3 py-2">
          <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
            Owner
          </span>
          <span className="truncate font-mono text-[length:var(--z-type-meta)] text-fg">
            {truncateAddress(owner)}
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <SectionLabel>Traits</SectionLabel>
        {traits && traits.length > 0 ? (
          <dl className="m-0 grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(120px,1fr))]">
            {traits.map((t, i) => (
              <div
                key={`${t.traitType}-${i}`}
                className="min-w-0 rounded-[12px] border border-[var(--z-line)] bg-[var(--z-glass)] px-2.5 py-2"
              >
                <dt className="truncate font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
                  {t.traitType}
                </dt>
                <dd className="m-0 mt-1 truncate text-[length:var(--z-type-row)] font-medium text-fg">
                  {t.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="m-0 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
            {loading
              ? "Reading metadata…"
              : "This token's metadata extension carries no traits. That is normal — the CW721 extension is optional."}
          </p>
        )}
      </div>

      {tokenUri ? (
        <div className="min-w-0">
          <SectionLabel>Metadata source</SectionLabel>
          <p
            className="m-0 mt-1.5 break-all font-mono text-[length:var(--z-type-micro)] leading-relaxed text-fg-dim"
            title={tokenUri}
          >
            {tokenUri}
          </p>
          {!loadMedia ? (
            <p className="m-0 mt-1.5 text-[length:var(--z-type-micro)] leading-relaxed text-fg-muted">
              {NFT_MEDIA_PRIVACY_NOTE}
            </p>
          ) : null}
        </div>
      ) : null}

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
