import { Hono } from "hono/tiny"
import { createGatewayOnEdgeRuntime } from "@lobehub/chat-plugins-gateway"

export const gateway = new Hono()
  .get("/", (c) =>
    c.json(
      { message: "GET /api/gateway is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => createGatewayOnEdgeRuntime()(c.req.raw))
