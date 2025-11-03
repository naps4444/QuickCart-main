// lib/authSeller.js
import User from "@/models/User";
import connectDB from "@/config/db";

export default async function authSeller(clerkId) {
  try {
    if (!clerkId) return false;

    await connectDB();

    // ✅ Use .lean() to ensure a plain JS object (avoids Mongoose getters confusion)
    const user = await User.findOne({ clerkId }).lean();

    if (!user) {
      console.warn("authSeller: no user found for", clerkId);
      return false;
    }

    // ✅ Log full user for debugging
    console.log("👤 Mongo user found:", user);

    // ✅ Normalize and compare role
    const roleValue = (user.role || "").toString().trim().toLowerCase();
    const isRoleSeller = roleValue === "seller";
    const isFlagSeller = user.isSeller === true;

    console.log("authSeller normalized check:", { roleValue, isRoleSeller, isFlagSeller });

    // ✅ Return true if either matches
    return isRoleSeller || isFlagSeller;
  } catch (err) {
    console.error("authSeller error:", err);
    return false;
  }
}
