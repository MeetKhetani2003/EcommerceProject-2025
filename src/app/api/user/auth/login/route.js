import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDb();
    const data = await req.json();

    const { email, password, googleId, provider = "local" } = data;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // 2️⃣ LOGIN BASED ON PROVIDER
    if (provider === "local") {
      // Password required
      if (!password) {
        return NextResponse.json(
          { message: "Password is required for login." },
          { status: 400 }
        );
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid password." },
          { status: 401 }
        );
      }
    }

    if (provider === "google") {
      if (!googleId) {
        return NextResponse.json(
          { message: "googleId is required for Google login." },
          { status: 400 }
        );
      }

      if (!user.googleId) {
        return NextResponse.json(
          {
            message:
              "This email is registered with Local method, not Google. Please login using password.",
          },
          { status: 409 }
        );
      }

      if (user.googleId !== googleId) {
        return NextResponse.json(
          { message: "Google ID mismatch. Unauthorized." },
          { status: 401 }
        );
      }
    }

    // 3️⃣ Prepare response
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      provider: user.provider,
    };

    return NextResponse.json(
      { user: userResponse, message: "Login successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error during login." },
      { status: 500 }
    );
  }
}
