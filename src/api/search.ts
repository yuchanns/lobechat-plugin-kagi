import { Hono } from "hono/tiny"
import {
  createErrorResponse,
  getPluginSettingsFromRequest,
  PluginErrorType,
} from "@lobehub/chat-plugin-sdk"
import { errorHandler } from "../utils"
import { Settings } from "../utils/search"

export const doSearch = async (query: string, settings: Settings) => {
  if (settings.Exclude) {
    const exclude = settings.Exclude.split(",").map((e) => e.trim())
    if (exclude.length > 0) {
      query = query + " -" + exclude.join(" -")
    }
  }
  const search = await fetch(
    `https://kagi.com/api/v0/search?q=${encodeURIComponent(query)}&limit=5`,
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
  }

  return "Search Results:\n" + json.data
    .filter((item) => item.t === 0)
    .slice(0, 5)
    .map((result) => `
- title: ${result.title}
  url: ${result.url}
  snippet: ${result.snippet}
`)
    .join("\n")
}

export const apiSearch = new Hono()
  .use("*", errorHandler)
  .get("/", (c) =>
    c.json(
      { message: "GET /api/search is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => {
    const params = (await c.req.json()) as { query: string }
    const settings = getPluginSettingsFromRequest<Settings>(c.req.raw)
    if (!settings) {
      return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
        message: "Plugin settings not found.",
      })
    }

    const formattedResponse = await doSearch(params.query, settings)

    return c.text(formattedResponse)
  })
