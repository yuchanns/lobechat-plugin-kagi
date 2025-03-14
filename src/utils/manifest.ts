export const get_manifest = (url: URL) => {
  const proto = url.protocol
  const host = url.host
  return {
    "$schema": "../node_modules/@lobehub/chat-plugin-sdk/schema.json",
    "version": "1",
    "identifier": "kagi-search",
    "author": "yuchanns",
    "homepage": "https://github.com/yuchanns/lobechat-plugin-kagi",
    "gateway": `${proto}//${host}/api/gateway`,
    "meta": {
      "avatar": "https://kagi.com/favicon-32x32.png",
      "tags": ["web", "search"],
      "title": "Kagi Search",
      "description": "Smart web search that reads and analyzes pages to deliver comprehensive answers from Kagi results."
    },
    "systemRole": "You are a helpful assistant that can search the web through Kagi Search Engine and return the results in a structured format to help the user with their queries.",
    "settings": {
      "type": "object",
      "required": ["API_KEY"],
      "properties": {
        "API_KEY": {
          "title": "API Key",
          "type": "string",
          "format": "password"
        },
        "Exclude": {
          "title": "Search Exclusion",
          "type": "string",
          "default": "reddit, youtube",
        }
      }
    },
    "api": [
      {
        "name": "searchWeb",
        "url": `${proto}//${host}/api/search`,
        "description": "Search Kagi for relevant web pages.",
        "parameters": {
          "required": ["query"],
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "What the user is looking for"
            }
          }
        }
      },
      {
        "name": "fetchContent",
        "url": `${proto}//${host}/api/fetch`,
        "description": "Fetch the content of a web page.",
        "parameters": {
          "required": ["url"],
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri",
              "description": "The URL of the web page to fetch"
            }
          }
        }
      },
      {
        "name": "getDate",
        "url": `${proto}//${host}/api/date`,
        "description": "Get the current date.",
        "parameters": {
          "type": "object",
          "properties": {}
        }
      }
    ]
  }
}
