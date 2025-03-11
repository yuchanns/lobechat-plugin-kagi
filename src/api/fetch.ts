import { Hono } from "hono/tiny";
import { errorHandler } from "../utils";
import { createDocument } from "@mixmark-io/domino";
import TurndownService from "turndown"

const turndownService = new TurndownService()
turndownService.remove(["script", "style", "header", "footer"])

export const doFetch = async (url: string) => {
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
  return markdown
}

export const apiFetch = new Hono()
  .use("*", errorHandler)
  .get("/", (c) =>
    c.json(
      { message: "GET /api/fetch is not supported, use POST instead" },
      405,
    )
  )
  .post("/", async (c) => {
    const params = (await c.req.json()) as { url: string }
    const content = await doFetch(params.url)
    return c.text(content)
  })
