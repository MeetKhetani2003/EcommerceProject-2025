import { NextResponse } from "next/server";
// Import the new GridFS client utility
import { uploadToGridFs, deleteFromGridFs } from "@/lib/gridFsClient";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";

export const dynamic = "force-dynamic";

// --- UTILITY FOR FILE UPLOAD (GridFS) ---

/**
 * Uploads a file to GridFS, handling the ArrayBuffer conversion.
 * @param {File} file - The file object obtained from request.formData().
 * @returns {Promise<{id: mongoose.Types.ObjectId, filename: string}>} The uploaded file details.
 */
async function uploadToBlob(file) {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  if (fileBuffer.length === 0) {
    throw new Error(`File upload rejected: ${file.name} is empty (0 bytes).`);
  }

  // CRITICAL FIX: SANITIZE FILENAME
  // 1. Remove non-alphanumeric, non-dot characters, replacing them with underscores.
  // 2. Prevent consecutive underscores.
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.]/g, "_")
    .replace(/_+/g, "_");

  const uniqueFilename = `${Date.now()}_${sanitizedName}`;

  const result = await uploadToGridFs(fileBuffer, uniqueFilename, file.type);

  return result; // returns { id: ObjectId, filename: string }
}

// --- POST HANDLER (Create Product with Image Upload) ---

export async function POST(request) {
  await connectDb();

  // Variables to track uploaded file IDs for rollback (stored as strings)
  const uploadedFileIds = [];

  try {
    const formData = await request.formData();
    const imageFrontFile = formData.get("imageFront");
    const imageBackFile = formData.get("imageBack");
    const productJson = formData.get("productData");
    const galleryFiles = formData.getAll("galleryImages");

    if (!imageFrontFile) {
      return NextResponse.json(
        { message: "Front image file is required." },
        { status: 400 }
      );
    }

    const productData = JSON.parse(productJson);
    let frontBlobResult = { id: null, filename: null };
    let backBlobResult = { id: null, filename: null };
    let galleryResults = [];

    // --- 1. Upload Images and Collect IDs/Filenames ---

    // a. Main Front Image
    frontBlobResult = await uploadToBlob(imageFrontFile);
    uploadedFileIds.push(frontBlobResult.id.toString());

    // b. Main Back Image (if provided)
    if (imageBackFile && imageBackFile.size > 0) {
      backBlobResult = await uploadToBlob(imageBackFile);
      uploadedFileIds.push(backBlobResult.id.toString());
    }

    // c. Gallery Images (if provided)
    if (galleryFiles && galleryFiles.length > 0) {
      const validGalleryFiles = galleryFiles.filter(
        (f) => f instanceof File && f.size > 0
      );

      for (const file of validGalleryFiles) {
        const result = await uploadToBlob(file);
        uploadedFileIds.push(result.id.toString());
        galleryResults.push({
          fileId: result.id,
          filename: result.filename,
        });
      }
    }

    // --- 2. Prepare MongoDB Data ---
    const finalProductData = {
      ...productData,
      imageFrontFileId: frontBlobResult.id,
      imageFrontFilename: frontBlobResult.filename,
      imageBackFileId: backBlobResult.id,
      imageBackFilename: backBlobResult.filename,
      gallery: galleryResults,
    };

    // --- 3. Save to MongoDB ---
    const newProduct = await Products.create(finalProductData);

    return NextResponse.json(
      {
        status: "success",
        product: newProduct.toObject({ virtuals: true }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product POST Error (GridFS):", error);

    // --- ERROR HANDLING & ROLLBACK (GridFS Deletion) ---
    if (uploadedFileIds.length > 0) {
      try {
        console.log(
          `Attempting to clean up ${uploadedFileIds.length} file(s) from GridFS...`
        );
        await Promise.all(
          uploadedFileIds.map((fileId) => deleteFromGridFs(fileId))
        );
        console.log("Cleanup complete.");
      } catch (cleanupError) {
        console.error("GridFS Cleanup Failed:", cleanupError.message);
      }
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { status: "fail", message: messages.join(". ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message:
          "Failed to create product or upload images. Rollback attempted.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// --- GET HANDLER (Filtering and Sorting) ---

export async function GET(request) {
  // ... GET handler logic is unchanged and is omitted for brevity but should be included here ...
  // (Your original GET handler code goes here)
  await connectDb();

  try {
    const { searchParams } = new URL(request.url);

    // --- 1. Define Filter Query ($match) ---
    let filter = {};

    const categories = searchParams.get("categories")?.split(",");
    if (categories && categories.length > 0) {
      filter.$or = [
        { filterableCategories: { $in: categories } },
        { category: { $in: categories } },
      ];
    }

    const sizes = searchParams.get("sizes")?.split(",");
    if (sizes && sizes.length > 0) {
      filter.availableSizes = { $in: sizes };
    }

    const themes = searchParams.get("themes")?.split(",");
    if (themes && themes.length > 0) {
      filter.theme = { $in: themes };
    }

    const priceRange = searchParams.get("priceRange");
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      if (!isNaN(min))
        filter["price.current"] = { ...filter["price.current"], $gte: min };
      if (!isNaN(max))
        filter["price.current"] = { ...filter["price.current"], $lte: max };
    }

    const flag = searchParams.get("flag");
    if (flag) {
      if (flag === "bestseller") filter.isBestseller = true;
      if (flag === "newarrival") filter.isNewArrival = true;
      if (flag === "recommended") filter.isRecommended = true;
    }

    // --- 2. Define Sorting ($sort) ---
    const sortBy = searchParams.get("sortBy") || "createdAt_desc";
    let sort = {};

    switch (sortBy) {
      case "price_asc":
        sort["price.current"] = 1;
        break;
      case "price_desc":
        sort["price.current"] = -1;
        break;
      case "newest":
      case "createdAt_desc":
        sort.createdAt = -1;
        break;
      case "popular":
        sort.salesCount = -1;
        break;
      case "name_asc":
        sort.name = 1;
        break;
      default:
        sort.createdAt = -1;
        break;
    }

    // --- 3. Pagination ($skip, $limit) ---
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // --- 4. Execute Query ---
    const productsPromise = Products.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCountPromise = Products.countDocuments(filter);

    const [products, totalCount] = await Promise.all([
      productsPromise,
      totalCountPromise,
    ]);

    return NextResponse.json({
      status: "success",
      results: products.length,
      page: page,
      totalPages: Math.ceil(totalCount / limit),
      totalProducts: totalCount,
      products: products.map((p) => p.toObject({ virtuals: true })),
    });
  } catch (error) {
    console.error("Product GET API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch products",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// --- DELETE HANDLER (Delete Product and GridFS Images) ---

// NOTE: This assumes DELETE is called with the product ID in the query, e.g., /api/products?id=12345
export async function DELETE(request) {
  await connectDb();

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required for deletion." },
        { status: 400 }
      );
    }

    const product = await Products.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    // --- 1. Collect all File IDs for cleanup ---
    const fileIdsToClean = [];

    // Main images
    if (product.imageFrontFileId)
      fileIdsToClean.push(product.imageFrontFileId.toString());
    if (product.imageBackFileId)
      fileIdsToClean.push(product.imageBackFileId.toString());

    // Gallery images
    product.gallery.forEach((img) => {
      if (img.fileId) fileIdsToClean.push(img.fileId.toString());
    });

    // --- 2. Delete product from MongoDB ---
    await Products.deleteOne({ _id: productId });

    // --- 3. Clean up files from GridFS (Cleanup runs *after* DB delete for reliability) ---
    if (fileIdsToClean.length > 0) {
      try {
        console.log(
          `Cleaning up ${fileIdsToClean.length} files from GridFS...`
        );
        await Promise.all(fileIdsToClean.map((id) => deleteFromGridFs(id)));
        console.log("GridFS cleanup successful.");
      } catch (cleanupError) {
        console.error(
          "GridFS Cleanup Failed after product deletion:",
          cleanupError.message
        );
        // Continue, as the main product deletion was successful
      }
    }

    return NextResponse.json(
      { status: "success", message: "Product and associated images deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product DELETE Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete product.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
