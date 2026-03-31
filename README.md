# matomoMCP

A lightweight MCP (Model Context Protocol) server that connects Claude Desktop to your Matomo Analytics instance.

## What it does

Allows you to query Matomo analytics data directly from Claude Desktop using natural language. Ask Claude about visits, bounce rates, traffic sources, conversions, events, and more — without opening a browser.

## Available tools

- **visits_summary** — visits, bounce rate, avg time on site, pageviews
- **unique_visitors** — unique visitors over time
- **goals_list** — list all configured goals
- **goals_conversions** — conversion rates and revenue per goal
- **events_category** — events grouped by category
- **events_action** — events grouped by action
- **events_name** — events grouped by name
- **top_pages** — most visited pages (URLs)
- **top_page_titles** — most visited pages (titles)
- **entry_pages** — landing pages
- **exit_pages** — exit pages
- **referrers_overview** — traffic sources overview
- **referrers_websites** — traffic from external websites
- **referrers_campaigns** — UTM campaign traffic
- **referrers_search** — search engine keywords
- **devices** — desktop / mobile / tablet breakdown
- **browsers** — browser usage
- **countries** — visitor countries
- **all_sites** — overview of all Matomo sites
- **ab_experiments** — A/B experiments (requires AbTesting plugin)

## Requirements

- Node.js v18+
- Claude Desktop
- A running Matomo instance with API access

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/ProductPope/matomoMCP.git
cd matomoMCP
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure Claude Desktop**

Open your Claude Desktop config file:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following to the `mcpServers` section:

```json
{
  "mcpServers": {
    "matomo": {
      "command": "node",
      "args": ["C:\\path\\to\\matomoMCP\\index.js"],
      "env": {
        "MATOMO_URL": "https://your-matomo-instance.com",
        "MATOMO_TOKEN": "your_token_auth_here"
      }
    }
  }
}
```

Replace:
- `C:\\path\\to\\matomoMCP\\index.js` with the actual path to the cloned repo
- `https://your-matomo-instance.com` with your Matomo URL
- `your_token_auth_here` with your Matomo API token (found in Matomo under Administration > Personal > Security > Auth token)

**4. Set default site ID**

In `index.js`, the default `idSite` is set to `1`. Change it to match your Matomo site ID if needed. You can find your site ID in the Matomo URL when browsing your dashboard.

**5. Restart Claude Desktop**

Quit Claude Desktop completely (including from the system tray) and relaunch it. The Matomo connector should appear under `+` > Connectors.

## Usage examples

Once connected, you can ask Claude:

- "Show me visits summary for the last 7 days"
- "What are the top landing pages this month?"
- "How are my UTM campaigns performing this week?"
- "What's the bounce rate trend over the last 4 weeks?"
- "Show me goal conversions for the last month"

## License

MIT
