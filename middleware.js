// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // 👇 Add any routes you want to keep public (unauthenticated access)
  publicRoutes: ["/", "/api/public(.*)"],
});

export const config = {
  matcher: [
    // ✅ Run middleware for all routes except Next.js internals & static assets
    "/((?!_next|.*\\..*|favicon.ico).*)",

    // ✅ Ensure all API & TRPC routes are protected
    "/(api|trpc)(.*)",
  ],
};
