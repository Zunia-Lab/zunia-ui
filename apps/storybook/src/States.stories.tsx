import type { Meta, StoryObj } from "@storybook/react";
import {
  Input,
  Switch,
  Segmented,
  Pill,
  Callout,
  AssetRow,
  EmptyState,
  PopupShell,
  ScreenScaffold,
} from "@zunialab/ui";
import { useState } from "react";

const meta: Meta = { title: "Primitives/States" };
export default meta;

type Story = StoryObj;

export const InputsAndFeedback: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4">
      <Input label="Recipient" placeholder="cosmos1…" />
      <Input label="Valid" state="valid" defaultValue="osmo1q9f…7k2d" trailing="VALID" />
      <Input
        label="Error"
        state="error"
        defaultValue="cosmos1t4…9ba"
        hint="Wrong chain"
      />
      <div className="flex gap-3">
        <Pill>Verified</Pill>
        <Pill tone="danger">Unverified</Pill>
        <Pill tone="accent">IBC</Pill>
      </div>
      <Callout title="Transfer confirmed" tone="info">
        25 ATOM · 4.1s
      </Callout>
      <Callout title="Unrecognised contract" tone="danger">
        Review the decoded messages before signing.
      </Callout>
      <EmptyState
        title="No NFTs yet"
        description="Collections on Stargaze appear here automatically."
      />
    </div>
  ),
};

export const WalletRows: Story = {
  render: () => (
    <div className="max-w-lg overflow-hidden rounded-[16px] border border-[var(--z-line)]">
      <AssetRow
        symbol="ATOM"
        chain="cosmoshub-4"
        balance="42.10"
        value="$482"
        selected
      />
      <AssetRow symbol="OSMO" chain="osmosis-1" balance="1,204" value="$890" />
      <AssetRow symbol="TIA" chain="celestia" balance="88" value="$306" />
    </div>
  ),
};

export const ExtensionPopup: Story = {
  render: () => {
    const [net, setNet] = useState("mainnet");
    const [on, setOn] = useState(true);
    return (
      <PopupShell>
        <ScreenScaffold title="Home">
          <div className="flex flex-col gap-4">
            <Segmented
              options={[
                { value: "mainnet", label: "Mainnet" },
                { value: "testnet", label: "Testnet" },
              ]}
              value={net}
              onChange={setNet}
            />
            <div className="flex items-center gap-3">
              <Switch checked={on} onCheckedChange={setOn} />
              <span className="text-[13px] text-fg-muted">Auto-lock</span>
            </div>
          </div>
        </ScreenScaffold>
      </PopupShell>
    );
  },
};
