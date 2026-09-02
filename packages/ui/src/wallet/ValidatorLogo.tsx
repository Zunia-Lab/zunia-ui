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
  moniker,
  size = 28,
  className,
}: ValidatorLogoInput & {
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

  const candidates = useMemo(() => validatorLogoCandidates(input), [input]);
  const [cachedUrl, setCachedUrl] = useState(() =>
    readValidatorLogoCache(input),
  );
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCachedUrl(readValidatorLogoCache(input));
    setIndex(0);
    setFailed(false);
  }, [input]);

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
          setIndex(0);
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
