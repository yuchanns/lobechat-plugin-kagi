import { MANIFEST } from "./manifest";

const DEV_HOST = "localhost:5173"

const api = MANIFEST.api.map((api) => {
  const url = new URL(api.url)
  url.host = DEV_HOST
  url.protocol = "http"
  return Object.assign({}, api, {
    url: url.toString(),
  })
})

const gateway = new URL(MANIFEST.gateway)
gateway.host = DEV_HOST
gateway.protocol = "http"

export const MANIFEST_DEV = Object.assign({}, MANIFEST, {
  "gateway": gateway.toString(),
  "api": api,
})
