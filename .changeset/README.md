# Changesets

Every change that alters published behaviour needs a changeset. Add one with:

```bash
pnpm changeset
```

Pick the packages affected and the bump type, then commit the generated markdown file
alongside your change. The release workflow turns accumulated changesets into version bumps,
a changelog and an npm publish.

Bump guidance for a design system consumed by a wallet:

- **patch**: visual fix, no API change.
- **minor**: new component or new optional prop.
- **major**: renamed or removed export, changed default, changed token value that alters
  contrast. Removing a token counts as breaking even though TypeScript will not always catch
  it at the call site.

`@zunialab/storybook` and `@zunialab/ui-native` are ignored because neither is published.
