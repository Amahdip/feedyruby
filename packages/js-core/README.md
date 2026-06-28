# FeedyRuby Browser JS Library

[![npm package](https://img.shields.io/npm/v/@feedyruby/js?style=flat-square)](https://www.npmjs.com/package/@feedyruby/js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Please see [FeedyRuby Docs](https://feedyruby.com/docs).
Specifically, [Quickstart/Implementation details](https://feedyruby.com/docs/getting-started/quickstart-in-app-survey).

## What is FeedyRuby

FeedyRuby is your go-to solution for in-product micro-surveys that will supercharge your product experience! 🚀 For more information please check out [feedyruby.com](https://feedyruby.com).

## How to use this library

1. Install the FeedyRuby package inside your project using npm:

```bash
npm install -s @feedyruby/js
```

2. Import FeedyRuby and initialize the widget in your main component (e.g., App.tsx or App.js):

```javascript
import feedyruby from "@feedyruby/js";

if (typeof window !== "undefined") {
  feedyruby.setup({
    workspaceId: "your-workspace-id",
    appUrl: "https://app.feedyruby.com",
  });
}
```

Replace your-environment-id with your actual environment ID. You can find your environment ID in the **Setup Checklist** in the FeedyRuby settings.

For more detailed guides for different frameworks, check out our [Framework Guides](https://feedyruby.com/docs/getting-started/framework-guides).
