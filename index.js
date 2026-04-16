#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const MATOMO_URL = process.env.MATOMO_URL || "https://your-matomo-instance.com";
const MATOMO_TOKEN = process.env.MATOMO_TOKEN || "";

async function matomo(method, params = {}) {
  const body = new URLSearchParams({
    module: "API",
    method,
    token_auth: MATOMO_TOKEN,
    format: "JSON",
    hideMetricsDoc: "1",
    ...params,
  });
  const res = await fetch(MATOMO_URL + "/index.php", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.json();
}

const SKIP_FIELDS = new Set(["segment", "logo", "logo_width", "logo_height", "documentation", "idSubtable"]);

function slim(data) {
  if (Array.isArray(data)) return data.map(slim);
  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([k]) => !SKIP_FIELDS.has(k))
        .map(([k, v]) => [k, slim(v)])
    );
  }
  return data;
}

function respond(data) {
  return { content: [{ type: "text", text: JSON.stringify(slim(data)) }] };
}

const server = new McpServer({
  name: "matomo",
  version: "1.0.0",
});

const periodEnum = z.enum(["day", "week", "month", "year", "range"]);
const base = { idSite: z.string().default("47"), period: periodEnum.default("week"), date: z.string().default("last4") };
const baseWithLimit = { ...base, filter_limit: z.string().default("10") };

// --- VISITS SUMMARY ---
server.tool("visits_summary", "Wizyty, bounce rate, czas na stronie, PV", base, async (p) => {
  return respond(await matomo("VisitsSummary.get", p));
});

// --- UNIQUE VISITORS ---
server.tool("unique_visitors", "Unikalni odwiedzający w czasie", base, async (p) => {
  return respond(await matomo("VisitsSummary.getUniqueVisitors", p));
});

// --- GOALS ---
server.tool("goals_list", "Lista wszystkich celów (goals) dla serwisu", { idSite: z.string().default("47") }, async (p) => {
  return respond(await matomo("Goals.getGoals", p));
});

server.tool("goals_conversions", "Konwersje i przychody dla celów", { ...base, idGoal: z.string().optional() }, async (p) => {
  return respond(await matomo("Goals.get", p));
});

// --- EVENTS ---
server.tool("events_category", "Eventy pogrupowane po kategorii", baseWithLimit, async (p) => {
  return respond(await matomo("Events.getCategory", p));
});

server.tool("events_action", "Eventy pogrupowane po akcji", baseWithLimit, async (p) => {
  return respond(await matomo("Events.getAction", p));
});

server.tool("events_name", "Eventy pogrupowane po nazwie", baseWithLimit, async (p) => {
  return respond(await matomo("Events.getName", p));
});

// --- PAGES / ACTIONS ---
server.tool("top_pages", "Najpopularniejsze strony (page URLs)", baseWithLimit, async (p) => {
  return respond(await matomo("Actions.getPageUrls", p));
});

server.tool("top_page_titles", "Najpopularniejsze strony (page titles)", baseWithLimit, async (p) => {
  return respond(await matomo("Actions.getPageTitles", p));
});

server.tool("entry_pages", "Strony wejścia (landing pages)", baseWithLimit, async (p) => {
  return respond(await matomo("Actions.getEntryPageUrls", p));
});

server.tool("exit_pages", "Strony wyjścia", baseWithLimit, async (p) => {
  return respond(await matomo("Actions.getExitPageUrls", p));
});

// --- REFERRERS ---
server.tool("referrers_overview", "Przegląd źródeł ruchu", base, async (p) => {
  return respond(await matomo("Referrers.get", p));
});

server.tool("referrers_websites", "Ruch z zewnętrznych stron", baseWithLimit, async (p) => {
  return respond(await matomo("Referrers.getWebsites", p));
});

server.tool("referrers_campaigns", "Ruch z kampanii UTM", baseWithLimit, async (p) => {
  return respond(await matomo("Referrers.getCampaigns", p));
});

server.tool("referrers_search", "Słowa kluczowe z wyszukiwarek", baseWithLimit, async (p) => {
  return respond(await matomo("Referrers.getKeywords", p));
});

// --- DEVICES ---
server.tool("devices", "Podział na urządzenia (desktop/mobile/tablet)", baseWithLimit, async (p) => {
  return respond(await matomo("DevicesDetection.getType", p));
});

server.tool("browsers", "Przeglądarki użytkowników", baseWithLimit, async (p) => {
  return respond(await matomo("DevicesDetection.getBrowsers", p));
});

// --- GEO ---
server.tool("countries", "Kraje odwiedzających", baseWithLimit, async (p) => {
  return respond(await matomo("UserCountry.getCountry", p));
});

// --- MULTISITE ---
server.tool("all_sites", "Przegląd wszystkich serwisów w Matomo", { period: periodEnum.default("week"), date: z.string().default("today") }, async (p) => {
  return respond(await matomo("MultiSites.getAll", p));
});

// --- AB TESTING ---
server.tool("ab_experiments", "Lista eksperymentów A/B (wymaga pluginu AbTesting)", { idSite: z.string().default("47") }, async (p) => {
  return respond(await matomo("AbTesting.getAvailableExperiments", p));
});

// START
const transport = new StdioServerTransport();
await server.connect(transport);
