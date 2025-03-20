import apiDate from "./date"
import apiFetch from "./fetch"
import apiSearch from "./search"

export const providers: APIProvider[] = [
  apiSearch,
  apiFetch,
  apiDate,
]
