import { Context, Next } from "hono";
import { createErrorResponse, PluginErrorType } from "@lobehub/chat-plugin-sdk";

export const errorHandler = async (_: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    console.log(err)
    return createErrorResponse(
      PluginErrorType.PluginServerError,
      err as object,
    );
  }
};

