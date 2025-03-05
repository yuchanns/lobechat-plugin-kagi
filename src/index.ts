import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { Hono } from "hono/tiny"
import { gateway, search } from "./api"
import { get_manifest } from "./utils"

const app = new Hono().use(
  prettyJSON(),
  logger(),
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: [
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Content-Type",
      "Date",
      "X-Api-Version",
      "x-lobe-trace",
      "x-lobe-plugin-settings",
      "x-lobe-chat-auth",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  }),
)

app
  .get("/", (c) => {
    return c.text("Welcome to Kagi Search Plugin!, A plugin for LobeChat to search the web through Kagi Search Engine. All the routes are under `/api`.")
  })
  .get("/manifest.json", (c) => {
    const url = new URL(c.req.url)
    return c.json(get_manifest(url))
  })
  .basePath("/api")
  .get("/", (c) => {
    return c.json({
      message: "Welcome to Kagi Search Plugin!",
      description:
        "A plugin for LobeChat to search the web through Kagi Search Engine.",
      routes: [
        {
          path: "/gateway",
          method: "POST",
          description: "Gateway for the plugin.",
        },
        {
          path: "/search",
          method: "POST",
          description: "Search the web through Kagi Search Engine.",
        },
      ],
    })
  })
  .route("/gateway", gateway)
  .route("/search", search)

export default app
