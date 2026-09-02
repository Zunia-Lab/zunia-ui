# ADR-0001: Retire `@zunialab/ui-native`

**Status:** Accepted  
**Date:** 2026-08-31

## Context

`packages/ui-native` was scaffolded as a React Native mirror of `@zunialab/ui`. Mobile shipping path is **Flutter** (`zunia-mobile`), not React Native. The package has no consumers and duplicates maintenance without product value.

## Decision

- Treat `@zunialab/ui-native` as **retired**. Do not add components or publish it.
- Prefer Flutter widgets in `zunia-mobile` and shared tokens from `@zunialab/tokens` / brand assets.
- Keep the package directory only until workspace cleanup removes it from `pnpm-workspace.yaml` (optional follow-up).

## Consequences

- Web + extension continue on `@zunialab/ui`.
- No RN bridge investment unless product strategy explicitly revisits React Native.
