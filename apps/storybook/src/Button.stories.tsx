import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@zunialab/ui";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Primary", variant: "primary" },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Rest</Button>
        <Button variant="primary" data-force-state="hover">
          Hover
        </Button>
        <Button variant="primary" data-force-state="press">
          Press
        </Button>
        <Button variant="primary" data-force-state="focus">
          Focus
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="primary" loading>
          Loading
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    </div>
  ),
};
