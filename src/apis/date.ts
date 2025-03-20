import { Hono } from "hono/tiny"

const route = new Hono()

const apiDate: APIProvider = {
  name: "getDate",
  path: "date",
  route: route,
  description: "Get the current date.",
  parameters: {
    type: "object",
    properties: {},
  },
}

route.post("/*", async (c) => {
  const date = new Date()
  const dateStr = date.toDateString()
  return c.text(dateStr)
})

export default apiDate
