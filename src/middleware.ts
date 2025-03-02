import { clerkMiddleware } from "@clerk/astro/server";
import type { MiddlewareResponseHandler } from "@clerk/types";

// List of public routes that don't require authentication
const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/about",
  "/privacy-policy",
  "/terms-of-service",
];

export const onRequest: MiddlewareResponseHandler = clerkMiddleware({
  afterAuth(auth, req, evt) {
    const url = new URL(req.url);
    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) =>
      url.pathname.startsWith(route),
    );

    // Allow public routes or authenticated users
    if (isPublicRoute || auth.userId) {
      return evt.next();
    }

    // Redirect unauthenticated users to sign-in
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return Response.redirect(signInUrl);
  },
  debug: true,
});
