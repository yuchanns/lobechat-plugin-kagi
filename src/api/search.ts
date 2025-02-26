import { Hono } from "hono/tiny"
import { parseHTML } from "linkedom"
import { Readability } from "@mozilla/readability"
import {
  createErrorResponse,
  getPluginSettingsFromRequest,
  PluginErrorType,
} from "@lobehub/chat-plugin-sdk"
import { errorHandler, PROMPT, ROLE } from "../utils"
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

  const contentPromises = items.map(async (item) => {
    try {
      const response = await fetch(item.url)
      const html = await response.text()
      const { document } = parseHTML(html)
      const reader = new Readability(document)
      const article = reader.parse()

      return {
        source: {
          title: item.title,
          url: item.url,
          description: item.snippet,
        },
        content: article?.textContent || "",
      }
    } catch (e) {
      console.log(e)
      return {
        source: {
          title: item.title,
          url: item.url,
          description: item.snippet,
        },
        content: "",
      }
    }
  })

  const results = await Promise.all(contentPromises)
  return `
Role: ${ROLE}

Prompt: ${PROMPT}

Query: ${query}

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
