import { createClerkClient } from "@clerk/nextjs/server";

// ✅ Initialize with your secret key
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
