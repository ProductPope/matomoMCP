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
    ...params,
  });
  const res = await fetch(MATOMO_URL + "/index.php", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.json();
}

const server = new McpServer({
  name: "matomo",
  version: "1.0.0",
});

const periodEnum = z.enum(["day", "week", "month", "year", "range"]);
const base = { idSite: z.string().default("47"), period: periodEnum.default("week"), date: z.string().default("last4") };

// --- VISITS SUMMARY ---
server.tool("visits_summary", "Wizyty, bounce rate, czas na stronie, PV", base, async (p) => {
  const data = await matomo("VisitsSummary.get", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- UNIQUE VISITORS ---
server.tool("unique_visitors", "Unikalni odwiedzający w czasie", base, async (p) => {
  const data = await matomo("VisitsSummary.getUniqueVisitors", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- GOALS ---
server.tool("goals_list", "Lista wszystkich celów (goals) dla serwisu", { idSite: z.string().default("47") }, async (p) => {
  const data = await matomo("Goals.getGoals", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("goals_conversions", "Konwersje i przychody dla celów", { ...base, idGoal: z.string().optional() }, async (p) => {
  const data = await matomo("Goals.get", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- EVENTS ---
server.tool("events_category", "Eventy pogrupowane po kategorii", base, async (p) => {
  const data = await matomo("Events.getCategory", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("events_action", "Eventy pogrupowane po akcji", base, async (p) => {
  const data = await matomo("Events.getAction", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("events_name", "Eventy pogrupowane po nazwie", base, async (p) => {
  const data = await matomo("Events.getName", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- PAGES / ACTIONS ---
server.tool("top_pages", "Najpopularniejsze strony (page URLs)", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Actions.getPageUrls", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("top_page_titles", "Najpopularniejsze strony (page titles)", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Actions.getPageTitles", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("entry_pages", "Strony wejścia (landing pages)", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Actions.getEntryPageUrls", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("exit_pages", "Strony wyjścia", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Actions.getExitPageUrls", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- REFERRERS ---
server.tool("referrers_overview", "Przegląd źródeł ruchu", base, async (p) => {
  const data = await matomo("Referrers.get", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("referrers_websites", "Ruch z zewnętrznych stron", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Referrers.getWebsites", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("referrers_campaigns", "Ruch z kampanii UTM", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Referrers.getCampaigns", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("referrers_search", "Słowa kluczowe z wyszukiwarek", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("Referrers.getKeywords", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- DEVICES ---
server.tool("devices", "Podział na urządzenia (desktop/mobile/tablet)", base, async (p) => {
  const data = await matomo("DevicesDetection.getType", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("browsers", "Przeglądarki użytkowników", base, async (p) => {
  const data = await matomo("DevicesDetection.getBrowsers", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- GEO ---
server.tool("countries", "Kraje odwiedzających", { ...base, filter_limit: z.string().default("20") }, async (p) => {
  const data = await matomo("UserCountry.getCountry", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- MULTISITE ---
server.tool("all_sites", "Przegląd wszystkich serwisów w Matomo", { period: periodEnum.default("week"), date: z.string().default("today") }, async (p) => {
  const data = await matomo("MultiSites.getAll", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- AB TESTING ---
server.tool("ab_experiments", "Lista eksperymentów A/B (wymaga pluginu AbTesting)", { idSite: z.string().default("47") }, async (p) => {
  const data = await matomo("AbTesting.getAvailableExperiments", p);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// START
const transport = new StdioServerTransport();
await server.connect(transport);