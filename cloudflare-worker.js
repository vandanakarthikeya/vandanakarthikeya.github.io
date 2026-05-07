/**
 * Cloudflare Worker — Anthropic API proxy for Personal Health Dashboard
 *
 * One-time setup after deploying this worker:
 *   1. In your worker dashboard → Settings → Variables → Add variable
 *      Name: ANTHROPIC_API_KEY   Value: sk-ant-your-key-here
 *   2. Copy your worker URL into personal-health-dashboard.html
 *      Find: const WORKER_URL = "..."  and paste your .workers.dev URL
 *
 * API key stays in Cloudflare — never exposed to the browser.
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: { message: "ANTHROPIC_API_KEY not set in worker environment variables" } }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const body = await request.text();

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const data = await upstream.text();

    return new Response(data, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
