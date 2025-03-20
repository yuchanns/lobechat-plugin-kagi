import { createErrorResponse, getPluginSettingsFromRequest, PluginErrorType } from "@lobehub/chat-plugin-sdk"
import { Hono } from "hono/tiny"

const route = new Hono()

const apiSearch: APIProvider = {
  name: "searchWeb",
  path: "search",
  route: route,
  description: "Search Kagi for relevant web pages",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "What the user is looking for.",
      }
    },
    required: ["query"],
  },
}

route.post("/*", async (c) => {
  let { query } = (await c.req.json()) as { query: string }
  const settings = getPluginSettingsFromRequest<Settings>(c.req.raw)
  if (!settings) {
    return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
      message: "Plugin settings not found.",
    })
  }

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
  const formattedResponse = "Search Results:\n" + json.data
    .filter((item) => item.t === 0)
    .slice(0, 5)
    .map((result) => `
- title: ${result.title}
  url: ${result.url}
  snippet: ${result.snippet}`
    )
    .join("\n")

  return c.text(formattedResponse)
})

export default apiSearch
