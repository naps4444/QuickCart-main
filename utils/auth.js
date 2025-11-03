import jwt from "jsonwebtoken";
import User from "@/models/User"; // your User model

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Verify JWT and return user object
export async function verifyToken(token) {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    return user || null;
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    return null;
  }
}
