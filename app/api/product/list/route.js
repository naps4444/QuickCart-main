
import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// ✅ GET /api/product/list
// Public route — returns all products for store pages
export async function GET() {
  try {
    // 1️⃣ Connect to the database
    await connectDB();

    // 2️⃣ Fetch all products (you can filter or sort later if needed)
    const products = await Product.find({}).sort({ date: -1 });

    // 3️⃣ Return response
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching all products:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
