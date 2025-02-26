import { Hono } from "hono/tiny"
import {
  createErrorResponse,
  getPluginSettingsFromRequest,
  PluginErrorType,
} from "@lobehub/chat-plugin-sdk"
import { Settings } from "../utils/search"
import { doSearch } from "./search"

export const gateway = new Hono()
  .get("/", (c) =>
    c.json(
      { message: "GET /api/gateway is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => {
    const data = await c.req.json() as { arguments: string }
    const args = JSON.parse(data.arguments) as {
      query: string
    }
    const settings = getPluginSettingsFromRequest<Settings>(c.req.raw)
    if (!settings) {
      return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
        message: "Plugin settings not found.",
      })
    }
    const text = await doSearch(args.query, settings)
    return c.text(text)
  })
