import { clerkMiddleware } from "@clerk/astro/server";

export const onRequest = clerkMiddleware({
  publicRoutes: ["/sign-in", "/sign-up"],
  debug: true
}); 