"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../primitives/WalletAvatar";
import {
  fetchValidatorAvatar,
  peekCachedAvatarUrl,
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
  logoSlugs,
  moniker,
  size = 28,
  className,
}: ValidatorLogoInput & {
  logoUrl?: string;
  moniker: string;
  size?: number;
  className?: string;
}) {
  const fallbacks = useMemo(
    () =>
      validatorLogoCandidates({
        chainId,
        chainName,
        operatorAddress,
        identity,
        logoSlugs,
      }),
    [chainId, chainName, operatorAddress, identity, logoSlugs],
  );

  const cached =
    peekCachedAvatarUrl(identity ?? "") ||
    readValidatorLogoCache({
      chainId,
      operatorAddress,
      identity: identity ?? "",
    });
  const initial = logoUrl || cached || fallbacks[0];

  const [src, setSrc] = useState<string | undefined>(initial);
  const [fallbackIndex, setFallbackIndex] = useState(() =>
    logoUrl || cached ? -1 : fallbacks[0] ? 0 : -1,
  );
  const [failed, setFailed] = useState(!initial);

  useEffect(() => {
    const nextCached =
      peekCachedAvatarUrl(identity ?? "") ||
      readValidatorLogoCache({
        chainId,
        operatorAddress,
        identity: identity ?? "",
      });
    const nextInitial = logoUrl || nextCached || fallbacks[0];
    setSrc(nextInitial);
    setFallbackIndex(logoUrl || nextCached ? -1 : fallbacks[0] ? 0 : -1);
    setFailed(!nextInitial);

    if (logoUrl) {
      writeValidatorLogoCache(
        { chainId, operatorAddress, identity: identity ?? "" },
        logoUrl,
      );
      return;
    }
    const keybaseHit = peekCachedAvatarUrl(identity ?? "");
    if (keybaseHit || !identity) return;

    let cancelled = false;
    void fetchValidatorAvatar(identity).then((url) => {
      if (cancelled || !url) return;
      writeValidatorLogoCache(
        { chainId, operatorAddress, identity },
        url,
      );
      setSrc(url);
      setFallbackIndex(-1);
      setFailed(false);
    });
    return () => {
      cancelled = true;
    };
  }, [chainId, operatorAddress, identity, logoUrl, fallbacks]);

  const shown = failed ? undefined : src;

  return (
    <Avatar
      src={shown}
      alt={moniker}
      fallback={moniker}
      size={size}
      className={className}
      onLoad={
        shown
          ? () => {
              writeValidatorLogoCache(
                { chainId, operatorAddress, identity: identity ?? "" },
                shown,
              );
            }
          : undefined
      }
      onError={() => {
        const next = fallbackIndex + 1;
        if (next >= 0 && next < fallbacks.length) {
          setSrc(fallbacks[next]);
          setFallbackIndex(next);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
