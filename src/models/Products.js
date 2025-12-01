import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Sub-Schema for the pricing structure
 */
const PriceSchema = new Schema(
  {
    current: { type: Number, required: true },
    old: { type: Number },
    discountText: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Sub-Schema for Product Detail Specifications (e.g., Fabric, Fit, Wash)
 */
const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true, trim: true }, // e.g., "Fabric"
    value: { type: String, required: true, trim: true }, // e.g., "100% Cotton, 240 GSM"
  },
  { _id: false }
);

/**
 * Sub-Schema for gallery images (Updated for GridFS)
 */
const GalleryImageSchema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, required: true }, // GridFS file ID
    filename: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Main Product Schema
 */
const ProductSchema = new Schema({
  // --- Product Details ---
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, "Product primary category is required"],
    trim: true,
    index: true,
  },
  price: {
    type: PriceSchema,
    required: true,
  },

  // --- Image Storage: GridFS Fields (Main Images) ---
  imageFrontFileId: {
    type: Schema.Types.ObjectId,
    required: [true, "Front image file ID is required"],
  },
  imageBackFileId: {
    type: Schema.Types.ObjectId,
  },
  imageFrontFilename: {
    // Storing filename is good for reference
    type: String,
    required: true,
  },
  imageBackFilename: {
    type: String,
  },
  // --- End GridFS Fields ---

  // --- NEW: Detailed Product Fields for Product Detail Page ---
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  // Specifications for the table display (e.g., Material, Neck Style)
  specifications: [SpecificationSchema],

  // Care and Material Notes
  material: {
    type: String,
    trim: true,
  },
  careInstructions: {
    type: String,
    trim: true,
  },

  // Gallery for extra product views (uses the updated GalleryImageSchema)
  gallery: [GalleryImageSchema],

  badges: [
    {
      type: String,
      trim: true,
    },
  ],

  // --- Filterable Fields ---
  filterableCategories: [
    {
      type: String,
      index: true,
    },
  ],
  availableSizes: [
    {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      required: true,
      index: true,
    },
  ],
  theme: {
    type: String,
    index: true,
  },

  // --- Special Product Flags/Tags ---
  isNewArrival: {
    type: Boolean,
    default: false,
    index: true,
  },
  isBestseller: {
    type: Boolean,
    default: false,
    index: true,
  },
  isRecommended: {
    type: Boolean,
    default: false,
    index: true,
  },

  salesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Virtuals (Generate URLs for client use) ---
// Assumes an image serving route: /api/images/:fileId
ProductSchema.virtual("imageFrontUrl").get(function () {
  return this.imageFrontFileId ? `/api/images/${this.imageFrontFileId}` : null;
});

ProductSchema.virtual("imageBackUrl").get(function () {
  return this.imageBackFileId ? `/api/images/${this.imageBackFileId}` : null;
});

// Alias for client-side consumption
ProductSchema.virtual("imageFront").get(function () {
  return this.imageFrontUrl;
});

ProductSchema.virtual("imageBack").get(function () {
  return this.imageBackUrl;
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

const Products =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Products;
