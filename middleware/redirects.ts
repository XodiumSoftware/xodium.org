import {Context} from "fresh";
import {State} from "../utils.ts";

/**
 * Redirect middleware to redirect all non-root paths to "/".
 * @param ctx - The Fresh context object containing application state.
 */
export async function redirectMiddleware(
  ctx: Context<State>,
) {
  const url = new URL(ctx.req.url);

  if (url.pathname !== "/") {
    return Response.redirect(new URL("/", url.origin), 308);
  }

  return await ctx.next();
}
