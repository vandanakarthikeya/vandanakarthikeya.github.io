/**
 * Cloudflare Worker — Anthropic API proxy for Personal Health Dashboard
 * Deploy at: https://workers.cloudflare.com (free, 100k requests/day)
 *
 * Deploy steps:
 *   1. Go to workers.cloudflare.com → sign up free → "Create a Worker"
 *   2. Replace the default code with this entire file
 *   3. Click "Save and Deploy"
 *   4. Copy your worker URL (e.g. https://health-proxy.yourname.workers.dev)
 *   5. Paste it into the Health Dashboard chatbot setup screen
 */

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Forward request to Anthropic
    const body = await request.text();
    const apiKey = request.headers.get("x-api-key") || "";
    const anthropicVersion = request.headers.get("anthropic-version") || "2023-06-01";

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": anthropicVersion,
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
