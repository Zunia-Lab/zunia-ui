# Releasing the design system

`@zunialab/ui`, `@zunialab/tokens` and `@zunialab/fonts` are published to npm and consumed by
`zunia-website`, `zunia-dashboard` and `zunia-extension` as versioned dependencies, per
[ADR-0005](../zunia-core/docs/adr/0005-polyrepo-package-flow.md).

`@zunialab/storybook` and `@zunialab/ui-native` are not published.

## Normal flow

1. Make the change and add a changeset:

   ```bash
   pnpm changeset
   ```

2. Open a pull request. CI runs contrast, parity, typecheck, tests and build.
3. On merge, the release workflow opens a "Version Packages" pull request containing the
   version bumps and changelog entries.
4. Merge that pull request. The workflow publishes to npm with provenance and dispatches a
   bump event to each consumer repository, which opens its own update pull request.

Nothing is published directly from a developer machine. `NPM_TOKEN` is a granular automation
token scoped to `@zunialab/*` and lives only in repository secrets.

## Signed tags

Changesets creates tags on publish. The repository requires signed tags, so the release role's
key must be configured in the runner:

```bash
git config --global user.signingkey <key-id>
git config --global tag.gpgSign true
```

Verify after a release:

```bash
git fetch --tags
git tag -v @zunialab/ui@<version>
```

## First publish

The npm scope must exist first. Track it as `npm.scope_reserved` in
`zunia-infra/provisioning/status.yaml`; it is currently `pending` and blocks this flow.

Once the scope is live:

```bash
pnpm install
pnpm build
pnpm changeset publish   # or let the workflow do it
```

Then remove the bootstrap `pnpm.overrides` block from every consumer, described in the next
section, and run `pnpm install` in each so the lockfile records registry versions.

## Bootstrap state, before the scope exists

Until `@zunialab/*` is on npm, consumers cannot resolve the semver ranges they declare. The
transition is handled without reverting to `file:` dependencies:

- `dependencies` declares the real contract, for example `"@zunialab/ui": "^0.1.0"`.
- A clearly marked `pnpm.overrides` block in the same `package.json` resolves that range to a
  local `link:` path so installs work today.

Deleting the override block is the only change needed once publishing works, and the declared
dependency is already correct. Each consumer's `package.json` carries a comment pointing here.

## Verifying a published package

```bash
npm view @zunialab/ui versions
npm view @zunialab/ui dist.integrity
gh attestation verify --owner Zunia-Lab $(npm pack @zunialab/ui --silent)
```
