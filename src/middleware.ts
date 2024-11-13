import { clerkMiddleware } from "@clerk/astro/server";
import type { MiddlewareResponseHandler } from "@clerk/types";

export const onRequest: MiddlewareResponseHandler = clerkMiddleware({
  afterAuth(auth, req, evt) {
    // Protect all routes by default
    if (!auth.userId && !req.url.includes('/sign-in') && !req.url.includes('/sign-up')) {
      const signInUrl = new URL('/sign-in', req.url);
      return Response.redirect(signInUrl);
    }
    return evt.next();
  },
  debug: true
}); 