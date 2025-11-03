import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Simple GET test route
export async function GET() {
  console.log("✅ GET /api/product/add route reached");
  return NextResponse.json({ success: true, message: "GET route working" });
}

// ✅ POST route with normalized seller auth
export async function POST(request) {
  console.log("✅ POST /api/product/add route reached");

  try {
    // Step 1: Get Clerk user ID
    let { userId } = auth();
    const authHeader = request.headers.get("authorization");
    console.log("🔍 Authorization header:", authHeader);

    // Step 2: Fallback manual verify if missing
    if (!userId && authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const payload = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        userId = payload.sub;
        console.log("🧩 userId from verifyToken:", userId);
      } catch (err) {
        console.error("🚫 Token verification failed:", err);
      }
    }

    console.log("🧩 Final Clerk userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing user ID" },
        { status: 401 }
      );
    }

    // Step 3: Connect to DB and get user
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    console.log("👤 MongoDB user found:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in MongoDB" },
        { status: 404 }
      );
    }

    // Step 4: Normalize seller logic
    const roleValue = (user.role || "").toString().trim().toLowerCase();
    const isRoleSeller = roleValue === "seller";
    const isFlagSeller = user.isSeller === true;
    const isSeller = isRoleSeller || isFlagSeller;

    console.log("authSeller normalized check:", {
      roleValue,
      isRoleSeller,
      isFlagSeller,
    });

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Not a seller" },
        { status: 403 }
      );
    }

    // Step 5: Parse form data
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    console.log("📦 Incoming product:", {
      name,
      category,
      price,
      filesCount: files?.length || 0,
    });

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Please upload product images",
      });
    }

    // Step 6: Upload to Cloudinary
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products", resource_type: "auto" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(buffer);
        });
      })
    );

    const images = uploadResults.map((res) => res.secure_url);
    console.log("🖼 Uploaded images:", images);

    // Step 7: Save product
    const newProduct = await Product.create({
      userId: user._id,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: images,
      date: Date.now(),
    });

    console.log("🎉 Product created successfully:", newProduct._id);

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      newProduct,
    });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
