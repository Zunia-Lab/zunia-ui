/**
 * Storybook stories for wallet recipe compositions.
 */
import type { Meta, StoryObj } from "@storybook/react";
import {
  AccountSwitcher,
  ApproveSession,
  ConfirmTransfer,
  TransferSent,
  TxDetail,
} from "@zunialab/ui";

const meta: Meta = {
  title: "Wallet/Recipes",
};
export default meta;

export const Confirm: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <ConfirmTransfer
        from="cosmos1abc…xyz"
        to="cosmos1def…uvw"
        amount="12.5"
        denom="ATOM"
        chainLabel="Cosmos Hub"
        fees={[
          { label: "Network fee", value: "0.002 ATOM" },
          { label: "Total", value: "12.502 ATOM", accent: true },
        ]}
      />
    </div>
  ),
};

export const Approve: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <ApproveSession
        dappName="Osmosis"
        dappUrl="https://app.osmosis.zone"
        chains={["cosmoshub-4", "osmosis-1"]}
        permissions={["View address", "Request signatures"]}
      />
    </div>
  ),
};

export const Accounts: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <AccountSwitcher
        activeAddress="cosmos1abc"
        accounts={[
          { address: "cosmos1abc", name: "Main", chainLabel: "Hub" },
          { address: "cosmos1def", name: "Trading" },
        ]}
        onSelect={() => undefined}
      />
    </div>
  ),
};

export const Tx: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <TxDetail
        hash="ABC123"
        status="success"
        chainLabel="cosmoshub-4"
        messages={[
          { type: "/cosmos.bank.v1beta1.MsgSend", summary: "Send 1 ATOM" },
        ]}
        fees={[{ label: "Fee", value: "0.002 ATOM" }]}
      />
    </div>
  ),
};

export const Sent: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <TransferSent
        hash="ABC123"
        step={3}
        total={3}
        steps={[
          { label: "Signed", state: "done" },
          { label: "Broadcast", state: "done" },
          { label: "Included", state: "current" },
        ]}
      />
    </div>
  ),
};
