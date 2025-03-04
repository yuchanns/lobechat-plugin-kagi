import { Hono } from "hono/tiny"
import TurndownService from "turndown"
import { createDocument } from "@mixmark-io/domino"
import {
  createErrorResponse,
  getPluginSettingsFromRequest,
  PluginErrorType,
} from "@lobehub/chat-plugin-sdk"
import { errorHandler } from "../utils"
import { Settings } from "../utils/search"

export const doSearch = async (query: string, settings: Settings) => {
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

  const items = json.data.filter((item) => item.t === 0).slice(0, 5)
  const turndownService = new TurndownService()

  const contentPromises = items.map(async (item) => {
    try {
      const response = await fetch(item.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
        }
      })
      if (response.status !== 200) {
        return ""
      }
      const html = await response.text()
      const document = createDocument(html);
      const markdown = turndownService.turndown(document)
      return markdown
    } catch (e) {
      return `Error fetching content: ${e}`
    }
  })

  const results = await Promise.all(contentPromises)
  return `
${results
      .filter((result) => result)
      .map(
        (result) => `${result}`,
      )
      .join("\n")}`
}

export const search = new Hono()
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
