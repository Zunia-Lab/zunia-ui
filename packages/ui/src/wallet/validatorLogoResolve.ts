/**
 * Validator moniker images, shared by the dashboard and the extension.
 *
 * Source is Cosmostation's chainlist on GitHub raw, which is already allowed
 * by the extension CSP (`img-src … https://raw.githubusercontent.com`).
 *
 * The resolved URL is stored against the validator's Keybase `identity`.
 * A new identity (operator rebrand / key rotation) drops the cache and
 * we resolve again. An unchanged identity keeps the cached URL forever.
 */

const CACHE_PREFIX = "zunia.validator.logo.v1:";

/** Cosmostation directory names that do not match chain-id / pretty name. */
const SLUG_ALIASES: Record<string, string> = {
  "cosmoshub-4": "cosmos",
  "osmosis-1": "osmosis",
  "celestia": "celestia",
  "neutron-1": "neutron",
  "akashnet-2": "akash",
  "juno-1": "juno",
  "kaiyo-1": "kujira",
  "phoenix-1": "terra",
  "dydx-mainnet-1": "dydx",
  "injective-1": "injective",
  "pacific-1": "sei",
  "core-1": "persistence",
  "stargaze-1": "stargaze",
  "stride-1": "stride",
  "noble-1": "noble",
  "axelar-dojo-1": "axelar",
  "evmos_9001-2": "evmos",
  "safrochain-1": "safrochain",
  "bbn-1": "babylon",
  "pio-mainnet-1": "provenance",
  "laozi-mainnet": "band",
  "regen-1": "regen",
  "sommelier-3": "sommelier",
  "umee-1": "umee",
  "quicksilver-2": "quicksilver",
  "chihuahua-1": "chihuahua",
  "bitcanna-1": "bitcanna",
  "bitsong-2b": "bitsong",
  "comdex-1": "comdex",
  "crescent-1": "crescent",
  "desmos-mainnet": "desmos",
  "emoney-3": "emoney",
  "fetchhub-4": "fetchai",
  "gravity-bridge-3": "gravity-bridge",
  "irishub-1": "iris",
  "kava_2222-10": "kava",
  "likecoin-mainnet-2": "likecoin",
  "lum-network-1": "lum",
  "mantle-1": "assetmantle",
  "osmosis-testnet": "osmosis-testnet",
  "theta-testnet-001": "cosmos-testnet",
};

export type ValidatorLogoInput = {
  chainId: string;
  chainName?: string;
  operatorAddress: string;
  /** Hex Keybase id from `description.identity`. Empty when unset. */
  identity?: string;
};

export type ValidatorLogoRecord = {
  identity: string;
  url: string;
  updatedAt: number;
};

export function validatorLogoCacheKey(
  chainId: string,
  operatorAddress: string,
): string {
  return `${CACHE_PREFIX}${chainId}:${operatorAddress}`;
}

export function validatorLogoSlugs(
  chainId: string,
  chainName?: string,
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

  push(SLUG_ALIASES[chainId]);
  push(chainName?.replace(/\s+/g, ""));
  push(chainName);
  push(chainId.replace(/_\d+-\d+$/, "").replace(/-\d+$/, ""));
  push(chainId);
  return slugs;
}

/** Ordered unique GitHub-raw URLs. First hit wins and is cached. */
export function validatorLogoCandidates(input: ValidatorLogoInput): string[] {
  const operator = input.operatorAddress.trim();
  if (!operator) return [];
  const urls: string[] = [];
  for (const slug of validatorLogoSlugs(input.chainId, input.chainName)) {
    urls.push(
      `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/${slug}/moniker/${operator}.png`,
    );
    urls.push(
      `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${slug}/moniker/${operator}.png`,
    );
  }
  return urls;
}

function storage(): Storage | undefined {
  try {
    if (typeof localStorage === "undefined") return undefined;
    return localStorage;
  } catch {
    return undefined;
  }
}

export function readValidatorLogoCache(
  input: ValidatorLogoInput,
): string | undefined {
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
