import { Hono } from "hono/tiny";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import {
  createErrorResponse,
  getPluginSettingsFromRequest,
  PluginErrorType,
} from "@lobehub/chat-plugin-sdk";
import { errorHandler, PROMPT, ROLE } from "../utils";

type Settings = {
  API_KEY: string
}

export const search = new Hono()
  .use('*', errorHandler)
  .get("/", (c) =>
    c.json(
      { message: "GET /api/search is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => {
    const params = (await c.req.json()) as { query: string };
    const settings = getPluginSettingsFromRequest<Settings>(c.req.raw);
    if (!settings) {
      return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
        message: "Plugin settings not found.",
      });
    }
    const search = await fetch(
      `https://kagi.com/api/v0/search?q=${encodeURIComponent(params.query)}&limit=5`,
      {
        headers: {
          Authorization: `Bot ${settings.API_KEY}`,
          "Content-Type": "application/json",
        }
      },
    )

    const json = (await search.json()) as {
      data: {
        t: number, title: string, url: string, snippet: string
      }[]
    };

    const items = json.data.filter((item) => item.t === 0).slice(0, 5)

    const contentPromises = items.map(async (item) => {
      try {
        const response = await fetch(item.url);
        const html = await response.text();
        const doc = new JSDOM(html);
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        return {
          source: {
            title: item.title,
            url: item.url,
            description: item.snippet,
          },
          content: article?.textContent || "",
        };
      } catch (e) {
        return {
          source: {
            title: item.title,
            url: item.url,
            description: item.snippet,
          },
          content: "",
        };
      }
    })

    const results = await Promise.all(contentPromises);
    const formattedResponse = `
Role: ${ROLE}

Prompt: ${PROMPT}

Query: ${params.query}

Data:
${results
        .filter((result) => result.content)
        .map(
          (result) => `
Source: ${result.source.title}
URL: ${result.source.url}
Content: ${result.content.trim()}
`,
        )
        .join("\n")}`;

    return c.text(formattedResponse);
  })
