/**
 * Media policy and placeholder art for NFT surfaces.
 *
 * The policy exists because `token_uri` and `image` point at arbitrary hosts
 * chosen by whoever minted the token. Rendering them is a network request from
 * the user's device to a stranger's server, which hands that server the user's
 * IP address and — because the request only happens for tokens they own — the
 * shape of their holdings. So media is off unless the caller turns it on, and
 * that switch is a visible prop rather than a hidden default.
 */

import { AVATAR_PALETTES, hashSeed } from "../lib/walletAvatar";

/** Shown wherever the media switch is offered. Same words in every client. */
export const NFT_MEDIA_PRIVACY_NOTE =
  "Artwork is fetched from whatever host the token points at, which tells that host your IP address and which tokens you hold. Nothing is loaded until you turn this on.";

/** Short form for a toggle label or a card overlay. */
export const NFT_MEDIA_LOAD_LABEL = "Load artwork";

/** What a card is currently showing in its media frame. */
export type NftMediaState =
  /** Media is off; the placeholder is the final state, not a loading step. */
  | "off"
  /** No URI on the token at all. Nothing to load even if media were on. */
  | "absent"
  | "loading"
  | "loaded"
  /** The host refused, timed out, or served something undecodable. */
  | "error";

/** Deterministic stand-in art, so a card without media still has an identity. */
export interface NftPlaceholder {
  readonly from: string;
  readonly to: string;
  readonly accent: string;
  /** One or two characters derived from the token id. */
  readonly monogram: string;
}

/**
 * Derive placeholder art from the token's identity.
 *
 * Same seed produces the same art in React and Flutter (both use the FNV-1a
 * `hashSeed`), so a token looks the same in the extension and on mobile.
 */
export function nftPlaceholder(seed: string): NftPlaceholder {
  const key = seed.trim().toLowerCase() || "nft";
  const h = hashSeed(key);
  const palette = AVATAR_PALETTES[h % AVATAR_PALETTES.length]!;
  return {
    from: palette.mid,
    to: palette.dark,
    accent: palette.accent,
    monogram: monogramFor(seed),
  };
}

/**
 * Up to two characters for the placeholder.
 *
 * Prefers trailing digits, because a CW721 token id is usually a number and its
 * last digits are what distinguishes one card from its neighbour.
 */
export function monogramFor(tokenId: string): string {
  const trimmed = tokenId.trim();
  if (trimmed.length === 0) return "?";
  const digits = trimmed.match(/\d+$/)?.[0];
  if (digits) return digits.slice(-2);
  return trimmed.slice(0, 2).toUpperCase();
}

/** Collection + token id as one line, with a sane fallback for each half. */
export function nftTitle(
  tokenId: string,
  name?: string | null,
): string {
  const trimmed = name?.trim();
  if (trimmed && trimmed.length > 0) return trimmed;
  return `#${tokenId}`;
}
