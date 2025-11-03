// app/api/seller/products/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const products = []; // fetch from DB
  return NextResponse.json({ products });
}
z