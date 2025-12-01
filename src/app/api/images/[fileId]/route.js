import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { connectDb } from "@/lib/dbConnect";

export const dynamic = "force-dynamic"; // always run on server, let CDN cache via headers

let bucket;

async function getGridFSBucket() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connection.asPromise();
  }

  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "productImages",
    });
  }

  return bucket;
}

// Small helper to guess MIME type if contentType is missing
function guessMime(filename = "") {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

export async function GET(request, context) {
  // 🚨 Your Next version makes params a Promise – unwrap it:
  const { fileId } = await context.params;

  if (!fileId) {
    return NextResponse.json(
      { message: "File ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectDb();
    const bucket = await getGridFSBucket();

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(fileId);
    } catch {
      return NextResponse.json({ message: "Invalid File ID" }, { status: 400 });
    }

    // 1️⃣ Get file metadata (needed for mime + ETag + Last-Modified)
    const file = await bucket.find({ _id: objectId }).next();

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const mime = file.contentType || guessMime(file.filename);
    const uploadedAt = file.uploadDate || new Date();
    const etag = `"${file._id.toString()}-${uploadedAt.getTime()}"`;

    // 2️⃣ Handle conditional requests for CDN/browser: return 304 if not changed
    const ifNoneMatch = request.headers.get("if-none-match");
    const ifModifiedSince = request.headers.get("if-modified-since");

    const notModifiedByEtag = ifNoneMatch && ifNoneMatch === etag;
    const notModifiedByDate =
      ifModifiedSince &&
      new Date(ifModifiedSince).getTime() >= uploadedAt.getTime();

    if (notModifiedByEtag || notModifiedByDate) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control":
            "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      });
    }

    // 3️⃣ Open GridFS stream
    const downloadStream = bucket.openDownloadStream(objectId);

    // 4️⃣ Convert Node stream → Web Stream (required by Next)
    const stream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("end", () => controller.close());
        downloadStream.on("error", (err) => {
          console.error("GridFS Download Error:", err);
          controller.error(err);
        });
      },
      cancel() {
        downloadStream.destroy();
      },
    });

    // 5️⃣ Return a streaming response with strong cache headers (CDN-friendly)
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": "inline", // ✅ render in tab, don't force download
        "Cache-Control":
          // 1 year browser + CDN cache, treat as immutable since fileId changes on change
          "public, max-age=31536000, s-maxage=31536000, immutable",
        ETag: etag,
        "Last-Modified": uploadedAt.toUTCString(),
      },
    });
  } catch (error) {
    console.error("GridFS Image Route Error:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
