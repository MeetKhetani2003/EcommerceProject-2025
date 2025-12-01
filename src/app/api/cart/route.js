import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import User from "@/models/User";
import { requireAuthUser } from "@/lib/auth";

/**
 * GET /api/cart
 * Returns cart with populated product data
 */
export async function GET(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  await connectDb();

  const populatedUser = await User.findById(user._id).populate("cart.product");
  const items = populatedUser.cart.map((item) => ({
    _id: item.product._id,
    qty: item.qty,
    product: item.product.toObject({ virtuals: true }),
  }));

  return NextResponse.json({
    status: "success",
    cart: items,
  });
}

/**
 * POST /api/cart
 * Body: { productId, qty? }
 */
export async function POST(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  await connectDb();

  const { productId, qty = 1 } = await request.json();

  if (!productId) {
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 }
    );
  }

  const product = await Products.findById(productId);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const index = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index === -1) {
    user.cart.push({ product: productId, qty });
  } else {
    user.cart[index].qty += qty;
  }

  await user.save();

  return NextResponse.json({ status: "success" });
}

/**
 * PATCH /api/cart
 * Body: { productId, qty }
 */
export async function PATCH(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  await connectDb();

  const { productId, qty } = await request.json();

  if (!productId || typeof qty !== "number") {
    return NextResponse.json(
      { message: "productId and qty are required" },
      { status: 400 }
    );
  }

  const index = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index === -1) {
    return NextResponse.json({ message: "Item not in cart" }, { status: 404 });
  }

  if (qty <= 0) {
    user.cart.splice(index, 1);
  } else {
    user.cart[index].qty = qty;
  }

  await user.save();

  return NextResponse.json({ status: "success" });
}

/**
 * DELETE /api/cart?productId=...
 */
export async function DELETE(request) {
  const { user, errorResponse } = await requireAuthUser(request);
  if (!user) return errorResponse;

  await connectDb();

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 }
    );
  }

  user.cart = user.cart.filter((item) => item.product.toString() !== productId);
  await user.save();

  return NextResponse.json({ status: "success" });
}
