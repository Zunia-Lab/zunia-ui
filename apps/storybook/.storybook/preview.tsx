import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "@zunialab/ui";
import "@zunialab/fonts/fonts.css";
import "@zunialab/ui/styles.css";
import "./preview.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      defaultValue: "dark",
      toolbar: {
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as "dark" | "light") ?? "dark";
      return React.createElement(
        ThemeProvider,
        { forcedTheme: theme, defaultTheme: theme },
        React.createElement(
          "div",
          {
            className: "zunia-root min-h-screen p-8 bg-bg text-fg",
            "data-theme": theme,
          },
          React.createElement(Story),
        ),
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" },
  },
};

export default preview;
