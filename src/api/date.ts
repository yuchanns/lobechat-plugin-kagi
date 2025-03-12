import { Hono } from "hono/tiny";
import { errorHandler } from "../utils";

export const apiDate = new Hono()
  .use("*", errorHandler)
  .get("/", (c) =>
    c.json(
      { message: "GET /api/date is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => {
    const date = new Date();
    const dateStr = date.toDateString();
    return c.text(dateStr);
  })
