import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Handle GET requests (prevents 405 error)
export async function GET(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing userId" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in MongoDB" },
        { status: 404 }
      );
    }

    // ✅ Ensure cartItems always exists and is an object
    const safeUser = {
      ...user.toObject(),
      cartItems: user.cartItems || {},
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ Handle POST requests (create a new product)
export async function POST(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request); // Clerk user ID
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing userId" },
        { status: 401 }
      );
    }

    // ✅ Find the matching user in MongoDB
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in MongoDB" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // ✅ Create a product tied to this user
    const product = await Product.create({
      ...body,
      userId: user._id,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
