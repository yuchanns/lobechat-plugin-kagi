import { LobeChatPluginManifest, PluginSchema } from "@lobehub/chat-plugin-sdk"

// Replace the following with your plugin's information
export const TITLE = "Kagi Search"
export const DESCRIPTION = "Smart web search that reads and analyzes pages to deliver comprehensive answers from Kagi results."
const IDENTIFIER = "kagi-search"
const HOMEPAGE = "https://github.com/yuchanns/lobechat-plugin-kagi"
const AUTHOR = "yuchanns"
const AVATAR = "https://kagi.com/favicon-32x32.png"
const TAGS: string[] = ["web", "search", "kagi"]
const SYSTEM_ROLE = "You are a helpful assistant that can search the web through Kagi Search Engine and return the results in a structured format to help the user with their queries."
const SETTINGS: PluginSchema = {
  type: "object",
  required: ["API_KEY"],
  properties: {
    "API_KEY": {
      "title": "API Key",
      "type": "string",
      "format": "password"
    },
    "Exclude": {
      "title": "Search Exclusion",
      "type": "string",
      "default": "reddit, youtube",
    },
    "Host": {
      "title": "Kagi Host",
      "type": "string",
      "default": "https://kagi.com",
      "description": "The Kagi host URL, default is https://kagi.com"
    }
  },
}

export const buildManifest = (url: URL, providers: APIProvider[]): LobeChatPluginManifest => {
  const { protocol, host } = url
  return {
    "$schema": "../node_modules/@lobehub/chat-plugin-sdk/schema.json",
    "version": "1",
    "identifier": IDENTIFIER,
    "author": AUTHOR,
    "homepage": HOMEPAGE,
    "gateway": `${protocol}//${host}/api/gateway`,
    "meta": {
      "avatar": AVATAR,
      "tags": TAGS,
      "title": TITLE,
      "description": DESCRIPTION
    },
    "systemRole": SYSTEM_ROLE,
    "settings": SETTINGS,
    "api": Object.entries(providers).map(([_, provider]) => ({
      "name": provider.name,
      "url": `${protocol}//${host}/api/${provider.path}`,
      "description": provider.description,
      "parameters": provider.parameters,
    })),
  }
}
