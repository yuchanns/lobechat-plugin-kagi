import { createDocument } from "@mixmark-io/domino"
import { Hono } from "hono/tiny"
import TurndownService from "turndown"

const route = new Hono()

const apiFetch: APIProvider = {
  name: "fetchContent",
  path: "fetch",
  route: route,
  description: "Fetch the content of a web page.",
  parameters: {
    required: ["url"],
    type: "object",
    properties: {
      "url": {
        type: "string",
        format: "uri",
        description: "The URL of the web page to fetch"
      }
    }
  },
}

const turndownService = new TurndownService()
turndownService.remove(["script", "style", "header", "footer"])

route.post("/*", async (c) => {
  const { url } = (await c.req.json()) as { url: string }
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    }
  })
  if (response.status !== 200) {
    throw new Error(`Error fetching content: ${response.status} ${response.statusText}`)
  }
  const html = await response.text()
  const document = createDocument(html)
  const markdown = turndownService.turndown(document)
  return c.text(markdown)
})

export default apiFetch

