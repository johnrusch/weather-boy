import { clerkMiddleware } from "@clerk/astro/server";

export const onRequest = clerkMiddleware({
  // Protect specific routes
  protect: ["/", "/profile"],
  // Public routes
  publicRoutes: ["/sign-in", "/sign-up"],
  // Optional: Debug mode
  debug: true,
  // Optional: Handle unauthorized access
  afterAuth(auth, req, evt) {
    // Redirect to sign-in if accessing protected route while signed out
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  }
}); 