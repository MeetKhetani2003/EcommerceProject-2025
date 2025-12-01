import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDb } from "./dbConnect";
import User from "@/models/User";

export async function getAuthUser(request) {
  // 1. Try cookie
  const cookieToken = request.cookies.get("token")?.value;

  // 2. Or Authorization: Bearer xxx
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = cookieToken || headerToken;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await connectDb();
    const user = await User.findById(payload.userId);
    return user || null;
  } catch (err) {
    console.error("getAuthUser error:", err.message);
    return null;
  }
}

// Optionally, small helper to enforce auth in routes
export async function requireAuthUser(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}
