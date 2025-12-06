import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDb } from "@/lib/dbConnect";

// GET CART
export async function GET() {
  await connectDb();
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json([]);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).populate("cart.product");

  return NextResponse.json(
    user.cart.map((item) => ({
      productId: item.product._id.toString(),
      name: item.product.name,
      price: item.product.price.current,
      image: item.product.imageFront,
      size: item.selectedSize,
      qty: item.qty,
    }))
  );
}

// ADD / UPDATE
export async function POST(req) {
  await connectDb();
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Login Required" },
      { status: 401 }
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { productId, size } = await req.json();

  const user = await User.findById(decoded.userId);

  const item = user.cart.find(
    (x) => x.product.toString() === productId && x.selectedSize === size
  );

  if (item) item.qty += 1;
  else user.cart.push({ product: productId, selectedSize: size, qty: 1 });

  await user.save();
  return NextResponse.json({
    success: true,
    message: "Item added to cart",
  });
}

// UPDATE QTY
export async function PATCH(req) {
  await connectDb();

  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ success: false }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const size = searchParams.get("size");
  const { qty } = await req.json();

  if (!productId || !size || qty === undefined)
    return NextResponse.json({ success: false, msg: "Missing data" });

  const user = await User.findById(decoded.userId);

  // 🔥 FIX: match with correct stored fields
  const item = user.cart.find(
    (x) => x.product.toString() === productId && x.selectedSize === size
  );

  if (!item) {
    return NextResponse.json({ success: false, msg: "Item not found" });
  }

  item.qty = qty;

  await user.save();

  return NextResponse.json({ success: true });
}

// REMOVE
export async function DELETE(req) {
  await connectDb();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const size = searchParams.get("size");

  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ success: false }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);

  user.cart = user.cart.filter(
    (item) =>
      !(item.product.toString() === productId && item.selectedSize === size)
  );

  await user.save();
  return NextResponse.json({ success: true });
}
