/**
 * Validator logos are not on chain. The staking module stores a Keybase
 * identity in `description.identity` (usually the last 16 hex characters of
 * the validator's PGP fingerprint). We look that account up on Keybase and
 * use `them[0].pictures.primary.url`.
 *
 * Cosmostation moniker PNGs are a fallback when Keybase has no picture.
 */

const AVATAR_PREFIX = "zunia.validator.avatar.v4:";
const HIT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 60 * 60 * 1000;
const KEYBASE_CONCURRENCY = 5;

const KEYBASE_LOOKUP =
  "https://keybase.io/_/api/1.0/user/lookup.json";

export type ValidatorLogoInput = {
  chainId: string;
  chainName?: string;
  operatorAddress: string;
  /** Hex Keybase id from `description.identity`. Empty when unset. */
  identity?: string;
  /** Already-resolved image URL (Keybase or Cosmostation). */
  logoUrl?: string;
  /**
   * Cosmostation directory names from the generated catalog, used only when
   * Keybase has no picture.
   */
  logoSlugs?: readonly string[];
};

export type ValidatorLogoRecord = {
  identity: string;
  url: string;
  updatedAt: number;
};

type AvatarCacheEntry = {
  url: string | null;
  timestamp: number;
};

const memory = new Map<string, AvatarCacheEntry>();
const inflight = new Map<string, Promise<string | null>>();

let keybaseActive = 0;
const keybaseWaiters: Array<() => void> = [];

async function withKeybaseLimit<T>(run: () => Promise<T>): Promise<T> {
  if (keybaseActive >= KEYBASE_CONCURRENCY) {
    await new Promise<void>((resolve) => keybaseWaiters.push(resolve));
  }
  keybaseActive += 1;
  try {
    return await run();
  } finally {
    keybaseActive -= 1;
    keybaseWaiters.shift()?.();
  }
}

/** Keybase `key_suffix` is hex. Rejects placeholders like `N/A`. */
export function isValidKeybaseIdentity(identity: string): boolean {
  const hex = identity.trim();
  return hex.length >= 8 && hex.length <= 64 && /^[0-9a-f]+$/i.test(hex);
}

function storage(): Storage | undefined {
  try {
    if (typeof localStorage === "undefined") return undefined;
    return localStorage;
  } catch {
    return undefined;
  }
}

function cacheKey(identity: string): string {
  return `${AVATAR_PREFIX}${identity.trim()}`;
}

function readEntry(identity: string): AvatarCacheEntry | undefined {
  const trimmed = identity.trim();
  const mem = memory.get(trimmed);
  if (mem) return mem;
  const store = storage();
  if (!store) return undefined;
  try {
    const raw = store.getItem(cacheKey(trimmed));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as AvatarCacheEntry;
    if (typeof parsed.timestamp !== "number") return undefined;
    memory.set(trimmed, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}

function writeEntry(identity: string, url: string | null): void {
  const trimmed = identity.trim();
  const entry: AvatarCacheEntry = { url, timestamp: Date.now() };
  memory.set(trimmed, entry);
  try {
    storage()?.setItem(cacheKey(trimmed), JSON.stringify(entry));
  } catch {
    /* private mode or quota */
  }
}

function liveUrl(entry: AvatarCacheEntry | undefined): string | null | undefined {
  if (!entry) return undefined;
  const age = Date.now() - entry.timestamp;
  if (entry.url && age < HIT_TTL_MS) return entry.url;
  if (entry.url === null && age < MISS_TTL_MS) return null;
  return undefined;
}

/** Cached Keybase picture, or null when a recent miss is stored. */
export function peekCachedAvatarUrl(identity: string): string | null | undefined {
  const trimmed = identity.trim();
  if (!trimmed || !isValidKeybaseIdentity(trimmed)) return undefined;
  return liveUrl(readEntry(trimmed));
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

async function lookupKeybase(identity: string): Promise<string | null> {
  return withKeybaseLimit(async () => {
    const response = await fetch(
      `${KEYBASE_LOOKUP}?key_suffix=${encodeURIComponent(identity)}&fields=pictures`,
      {
        credentials: "omit",
        referrer: "",
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as {
      them?: Array<{ pictures?: { primary?: { url?: string } } }>;
    };
    return body.them?.[0]?.pictures?.primary?.url?.trim() || null;
  });
}

/**
 * Keybase profile picture for a validator `description.identity`.
 * Hits stay 7 days. Misses stay 1 hour so a list does not hammer Keybase.
 */
export async function fetchValidatorAvatar(
  identity: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const trimmed = identity.trim();
  if (!trimmed) return null;
  if (!isValidKeybaseIdentity(trimmed)) {
    writeEntry(trimmed, null);
    return null;
  }

  const cached = liveUrl(readEntry(trimmed));
  if (cached !== undefined) return cached;

  const pending = inflight.get(trimmed);
  if (pending) return pending;

  const request = (async () => {
    try {
      // Shared across every row with this identity. Do not thread a
      // component AbortSignal through here: React strict-mode remounts
      // abort that signal and would poison the 1-hour miss cache.
      const url = await lookupKeybase(trimmed);
      writeEntry(trimmed, url);
      return url;
    } catch (error) {
      if (isAbortError(error)) return null;
      writeEntry(trimmed, null);
      return null;
    } finally {
      inflight.delete(trimmed);
    }
  })();

  inflight.set(trimmed, request);
  if (!signal) return request;
  return new Promise<string | null>((resolve, reject) => {
    const onAbort = () => resolve(null);
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    request.then(
      (url) => {
        signal.removeEventListener("abort", onAbort);
        resolve(url);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

/** Batch Keybase lookups, 5 at a time, skipping identities already cached. */
export async function fetchValidatorAvatars(
  identities: readonly string[],
  signal?: AbortSignal,
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const unique = [
    ...new Set(identities.map((id) => id.trim()).filter(Boolean)),
  ];
  const need: string[] = [];
  for (const id of unique) {
    const hit = peekCachedAvatarUrl(id);
    if (hit !== undefined) {
      results.set(id, hit);
    } else {
      need.push(id);
    }
  }

  const batchSize = 5;
  for (let i = 0; i < need.length; i += batchSize) {
    if (signal?.aborted) break;
    const batch = need.slice(i, i + batchSize);
    const rows = await Promise.all(
      batch.map(async (id) => ({
        id,
        url: await fetchValidatorAvatar(id, signal),
      })),
    );
    for (const row of rows) results.set(row.id, row.url);
  }
  return results;
}

/** @deprecated Use {@link fetchValidatorAvatar}. */
export async function resolveKeybaseLogoUrl(
  identity: string,
  signal?: AbortSignal,
): Promise<string | undefined> {
  const url = await fetchValidatorAvatar(identity, signal);
  return url ?? undefined;
}

export function validatorLogoCacheKey(
  chainId: string,
  operatorAddress: string,
): string {
  return `zunia.validator.logo.v2:${chainId}:${operatorAddress}`;
}

export function validatorLogoSlugs(
  chainId: string,
  chainName?: string,
  extra?: readonly string[],
  operatorAddress?: string,
): string[] {
  const slugs: string[] = [];
  const push = (value: string | undefined) => {
    const slug = (value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "")
      .replace(/^-+|-+$/g, "");
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  };

  for (const slug of extra ?? []) push(slug);
  push(operatorAddress?.match(/^([a-z0-9]+)valoper/i)?.[1]);
  push(chainName?.replace(/\s+/g, ""));
  push(chainName);
  push(chainId.replace(/_\d+-\d+$/, "").replace(/-\d+$/, ""));
  push(chainId);
  return slugs;
}

/** Cosmostation GitHub-raw URLs. Used only after Keybase misses. */
export function validatorLogoCandidates(input: ValidatorLogoInput): string[] {
  const operator = input.operatorAddress.trim();
  if (!operator) return [];
  const urls: string[] = [];
  for (const slug of validatorLogoSlugs(
    input.chainId,
    input.chainName,
    input.logoSlugs,
    operator,
  )) {
    urls.push(
      `https://cdn.jsdelivr.net/gh/cosmostation/chainlist@master/chain/${slug}/moniker/${operator}.png`,
    );
    urls.push(
      `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/${slug}/moniker/${operator}.png`,
    );
    urls.push(
      `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${slug}/moniker/${operator}.png`,
    );
  }
  return urls;
}

export function readValidatorLogoCache(
  input: ValidatorLogoInput,
): string | undefined {
  const fromIdentity = peekCachedAvatarUrl(input.identity ?? "");
  if (fromIdentity) return fromIdentity;
  const store = storage();
  if (!store || !input.operatorAddress) return undefined;
  try {
    const raw = store.getItem(
      validatorLogoCacheKey(input.chainId, input.operatorAddress),
    );
    if (!raw) return undefined;
    const record = JSON.parse(raw) as ValidatorLogoRecord;
    if (record.identity !== (input.identity ?? "")) return undefined;
    return record.url || undefined;
  } catch {
    return undefined;
  }
}

export function writeValidatorLogoCache(
  input: ValidatorLogoInput,
  url: string,
): void {
  // Identity cache is Keybase-only. A Cosmostation fallback must not
  // masquerade as a Keybase hit or we skip the real picture for 7 days.
  if (
    input.identity &&
    isValidKeybaseIdentity(input.identity) &&
    !url.includes("cosmostation/chainlist")
  ) {
    writeEntry(input.identity, url);
  }
  const store = storage();
  if (!store || !input.operatorAddress || !url) return;
  const record: ValidatorLogoRecord = {
    identity: input.identity ?? "",
    url,
    updatedAt: Date.now(),
  };
  try {
    store.setItem(
      validatorLogoCacheKey(input.chainId, input.operatorAddress),
      JSON.stringify(record),
    );
  } catch {
    /* private mode or quota */
  }
}

export function clearValidatorLogoCache(
  chainId: string,
  operatorAddress: string,
): void {
  try {
    storage()?.removeItem(validatorLogoCacheKey(chainId, operatorAddress));
  } catch {
    /* ignore */
  }
}
