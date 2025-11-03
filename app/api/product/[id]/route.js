import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import { verifyToken } from "@/utils/auth";

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse form-data
async function parseForm(req) {
  const form = formidable({ multiples: true, uploadDir: "./public/uploads", keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// GET product
export async function GET(req, { params }) {
  const { id } = params;
  try {
    await connectDB();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

// PUT product (edit)
export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    if (product.seller.toString() !== user._id) return NextResponse.json({ success: false, message: "Not allowed" }, { status: 403 });

    const { fields, files } = await parseForm(req);

    // Update fields
    const { title, description, category, price, offerPrice, existingImages } = fields;
    product.title = title;
    product.description = description;
    product.category = category;
    product.price = Number(price);
    product.offerPrice = Number(offerPrice);

    // Handle images
    let existing = [];
    try {
      existing = existingImages ? JSON.parse(existingImages) : [];
    } catch { existing = []; }

    // Remove deleted images
    const removedImages = product.images.filter(img => !existing.includes(img));
    removedImages.forEach(imgPath => {
      const filePath = path.join(process.cwd(), "public", imgPath.replace("/", ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Add new uploaded images
    const uploadedImages = Object.values(files).flat().map(file => `/uploads/${path.basename(file.filepath)}`);
    product.images = [...existing, ...uploadedImages];

    await product.save();

    return NextResponse.json({ success: true, product, message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update product" }, { status: 500 });
  }
}
