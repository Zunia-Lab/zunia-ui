"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../primitives/WalletAvatar";
import {
  clearValidatorLogoCache,
  readValidatorLogoCache,
  validatorLogoCandidates,
  writeValidatorLogoCache,
  type ValidatorLogoInput,
} from "./validatorLogoResolve";

export function ValidatorLogo({
  chainId,
  chainName,
  operatorAddress,
  identity,
  logoUrl,
  moniker,
  size = 28,
  className,
}: ValidatorLogoInput & {
  /** Server-resolved URL (Cosmostation / Keybase). Preferred when present. */
  logoUrl?: string;
  moniker: string;
  size?: number;
  className?: string;
}) {
  const input = useMemo<ValidatorLogoInput>(
    () => ({
      chainId,
      chainName,
      operatorAddress,
      identity: identity ?? "",
    }),
    [chainId, chainName, operatorAddress, identity],
  );

  const candidates = useMemo(() => {
    const list = validatorLogoCandidates(input);
    if (logoUrl && !list.includes(logoUrl)) return [logoUrl, ...list];
    if (logoUrl) return [logoUrl, ...list.filter((u) => u !== logoUrl)];
    return list;
  }, [input, logoUrl]);

  const [cachedUrl, setCachedUrl] = useState(() =>
    readValidatorLogoCache(input),
  );
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cached = readValidatorLogoCache(input);
    // Prefer a fresh server URL over a stale cache entry.
    if (logoUrl) {
      writeValidatorLogoCache(input, logoUrl);
      setCachedUrl(logoUrl);
    } else {
      setCachedUrl(cached);
    }
    setIndex(0);
    setFailed(false);
  }, [input, logoUrl]);

  const src = failed ? undefined : (cachedUrl ?? candidates[index]);

  return (
    <Avatar
      src={src}
      alt={moniker}
      fallback={moniker}
      size={size}
      className={className}
      onLoad={
        src
          ? () => {
              writeValidatorLogoCache(input, src);
            }
          : undefined
      }
      onError={() => {
        if (cachedUrl) {
          clearValidatorLogoCache(chainId, operatorAddress);
          setCachedUrl(undefined);
          setIndex(logoUrl ? 1 : 0);
          return;
        }
        if (index + 1 < candidates.length) {
          setIndex((current) => current + 1);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
