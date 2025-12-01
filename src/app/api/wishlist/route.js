import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import User from "@/models/User";
import { requireAuthUser } from "@/lib/auth";

/**
 * GET /api/wishlist
 * Returns populated wishlist (full product data)
 */
export async function GET(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  await connectDb();

  const populatedUser = await User.findById(user._id).populate("wishlist");
  return NextResponse.json({
    status: "success",
    wishlist: populatedUser.wishlist,
  });
}

/**
 * POST /api/wishlist
 * Body: { productId }
 */
export async function POST(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  await connectDb();

  const body = await request.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 }
    );
  }

  const productExists = await Products.findById(productId);
  if (!productExists) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  // Avoid duplicates
  if (!user.wishlist.some((id) => id.toString() === productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  return NextResponse.json({ status: "success" });
}

/**
 * DELETE /api/wishlist?productId=...
 */
export async function DELETE(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 }
    );
  }

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );
  await user.save();

  return NextResponse.json({ status: "success" });
}
