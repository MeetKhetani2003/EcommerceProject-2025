"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* --------------------------------- */
/* -------- CATEGORY DATA ----------- */
/* --------------------------------- */

const CATEGORY_MAP = {
  clothes: {
    Shirts: [
      "Half Sleeve",
      "Full Sleeve",
      "Linen",
      "Embroidered",
      "Designer",
      "Office Wear",
      "Check",
      "Plain",
      "Imported",
      "Denim",
    ],
    "Polo T-Shirts": [],
    "Round Neck T-Shirts": ["Crew Neck", "Drop Shoulder", "Oversized"],
    "Winter Wear": ["Jackets", "Sweaters", "Sweatshirts"],
    "Full Sleeve T-Shirts": [],
    Denim: [
      "Ankle Fit",
      'Straight Fit (14")',
      "Comfort Narrow",
      'Regular Fit (16", 18")',
      "Baggy Fit",
    ],
    "Cotton / Chinos": ["Ankle Fit", "Comfort Fit"],
    "Formal Pants": ["Ankle Fit", "Straight Fit", "Comfort Fit"],
    "Track Pants": [
      "Dry Fit Fabric",
      "Cotton Fleece Fabric",
      "Ankle Fit",
      "Straight Fit",
    ],
    "Dry Fit T-Shirts": ["Round Neck", "Collar Free"],
  },

  shoes: {
    Shoes: ["Sports Shoes", "Sneakers"],
    Slippers: ["Flip Flops", "Strap Slippers"],
    Crocs: ["Men", "Women"],
  },

  accessories: {
    "Perfume / Deo": ["Replica", "Indian Made", "Premium Collection"],
    Deodorants: ["Gas Deo", "Water Deo"],
    Watches: ["Analog", "Battery", "Automatic"],
  },
};

/* --------------------------------- */
/* -------- TABS -------------------- */
/* --------------------------------- */

const TABS = {
  LIST: "list",
  CREATE: "create",
  EDIT: "edit",
};

/* --------------------------------- */
/* -------- MAIN PAGE --------------- */
/* --------------------------------- */

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState(TABS.LIST);
  const [editProductId, setEditProductId] = useState(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#4a2e1f]">Products</h1>

      <div className="flex gap-3 border-b border-[#ead7c5]">
        <Tab
          active={activeTab === TABS.LIST}
          onClick={() => setActiveTab(TABS.LIST)}
        >
          Product Listing
        </Tab>

        <Tab
          active={activeTab === TABS.CREATE}
          onClick={() => {
            setEditProductId(null);
            setActiveTab(TABS.CREATE);
          }}
        >
          Create Product
        </Tab>

        {activeTab === TABS.EDIT && <Tab active>Edit Product</Tab>}
      </div>

      {activeTab === TABS.LIST && (
        <ProductList
          onEdit={(id) => {
            setEditProductId(id);
            setActiveTab(TABS.EDIT);
          }}
        />
      )}

      {(activeTab === TABS.CREATE || activeTab === TABS.EDIT) && (
        <CreateProduct
          productId={editProductId}
          onSuccess={() => {
            setEditProductId(null);
            setActiveTab(TABS.LIST);
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------- */
/* -------- PRODUCT LIST ------------ */
/* --------------------------------- */

function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  return (
    <div className="bg-white border border-[#ead7c5] rounded-xl overflow-hidden">
      <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-[#fdf7f2] text-sm font-medium">
        <div>Product</div>
        <div>Category</div>
        <div>Price</div>
        <div>Stock</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>

      {products.map((p) => (
        <div
          key={p._id}
          className="grid grid-cols-6 gap-4 px-4 py-3 border-t text-sm"
        >
          <div className="font-medium">{p.name}</div>
          <div>{p.category}</div>
          <div>₹{p.price?.current}</div>
          <div>{p.stock}</div>
          <div className="text-xs">
            {p.isNewArrival && "New "}
            {p.isBestseller && "Best "}
            {p.featured && "Featured"}
          </div>
          <div className="text-right">
            <button onClick={() => onEdit(p._id)} className="underline">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- */
/* -------- CREATE / EDIT ----------- */
/* --------------------------------- */

function CreateProduct({ productId, onSuccess }) {
  const isEdit = !!productId;
  const [product, setProduct] = useState(null);

  const [mainCategory, setMainCategory] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const [flags, setFlags] = useState({
    isNewArrival: false,
    isBestseller: false,
    featured: false,
  });

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setProduct(p);
        setMainCategory(p.mainCategory || "");
        setCategory(p.category || "");
        setSubcategory(p.subcategory || "");
        setFlags({
          isNewArrival: !!p.isNewArrival,
          isBestseller: !!p.isBestseller,
          featured: !!p.featured,
        });
      });
  }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();

    const front = f.imageFront?.files?.[0];
    const back = f.imageBack?.files?.[0];
    if (front) fd.append("imageFront", front);
    if (back) fd.append("imageBack", back);

    if (f.galleryImages?.files?.length) {
      [...f.galleryImages.files].forEach((img) =>
        fd.append("galleryImages", img)
      );
    }

    const productData = {
      name: f.name.value,
      brand: f.brand.value,
      mainCategory,
      category,
      subcategory,
      price: {
        current: Number(f.priceCurrent.value),
        old: Number(f.priceOld.value),
        discountText: f.discountText.value,
      },
      stock: Number(f.stock.value),
      salesCount: Number(f.salesCount.value),
      description: f.description.value,
      ...flags,
    };

    fd.append("productData", JSON.stringify(productData));
    if (isEdit) fd.append("productId", productId);

    const res = await fetch("/api/products", {
      method: isEdit ? "PUT" : "POST",
      body: fd,
    });

    if (!res.ok) return alert("Failed to save product");

    toast.success(isEdit ? "Product Updated" : "Product Created");
    onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-xl p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      {/* BASIC */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input name="name" label="Product Name" defaultValue={product?.name} />
        <Input name="brand" label="Brand" defaultValue={product?.brand} />
      </div>

      {/* CATEGORY */}
      <div className="grid md:grid-cols-3 gap-4">
        <Select
          label="Main Category"
          value={mainCategory}
          onChange={(e) => {
            setMainCategory(e.target.value);
            setCategory("");
            setSubcategory("");
          }}
        >
          <option value="">Select Main Category</option>
          <option value="clothes">Clothes</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </Select>

        <Select
          label="Category"
          value={category}
          disabled={!mainCategory}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory("");
          }}
        >
          <option value="">Select Category</option>
          {mainCategory &&
            Object.keys(CATEGORY_MAP[mainCategory]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </Select>

        <Select
          label="Sub Category"
          value={subcategory}
          disabled={!category}
          onChange={(e) => setSubcategory(e.target.value)}
        >
          <option value="">Select Sub Category</option>
          {mainCategory &&
            category &&
            CATEGORY_MAP[mainCategory][category]?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </Select>
      </div>

      {/* PRICING */}
      <div className="grid md:grid-cols-3 gap-4">
        <Input
          name="priceCurrent"
          label="Current Price"
          type="number"
          defaultValue={product?.price?.current}
        />
        <Input
          name="priceOld"
          label="Old Price"
          type="number"
          defaultValue={product?.price?.old}
        />
        <Input
          name="discountText"
          label="Discount Text"
          defaultValue={product?.price?.discountText}
        />
      </div>

      {/* STOCK */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          name="stock"
          label="Stock Quantity"
          type="number"
          defaultValue={product?.stock}
        />
        <Input
          name="salesCount"
          label="Sales Count"
          type="number"
          defaultValue={product?.salesCount}
        />
      </div>

      <Textarea
        name="description"
        label="Description"
        defaultValue={product?.description}
      />

      {/* IMAGES */}
      <div className="grid md:grid-cols-2 gap-4">
        <FileInput name="imageFront" label="Front Image" />
        <FileInput name="imageBack" label="Back Image" />
      </div>

      <FileInput name="galleryImages" label="Gallery Images" multiple />

      {/* FLAGS */}
      <div className="flex gap-6 text-sm">
        <Checkbox
          label="New Arrival"
          checked={flags.isNewArrival}
          onChange={(e) =>
            setFlags({ ...flags, isNewArrival: e.target.checked })
          }
        />
        <Checkbox
          label="Best Seller"
          checked={flags.isBestseller}
          onChange={(e) =>
            setFlags({ ...flags, isBestseller: e.target.checked })
          }
        />
        <Checkbox
          label="Featured"
          checked={flags.featured}
          onChange={(e) => setFlags({ ...flags, featured: e.target.checked })}
        />
      </div>

      <button className="bg-[#4a2e1f] text-white px-6 py-2 rounded">
        {isEdit ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}

/* --------------------------------- */
/* -------- UI HELPERS -------------- */
/* --------------------------------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input {...props} className="w-full border px-3 py-2 rounded" />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select {...props} className="w-full border px-3 py-2 rounded">
        {children}
      </select>
    </div>
  );
}

function FileInput({ label, multiple = false, ...props }) {
  const [previews, setPreviews] = useState([]);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const urls = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(urls);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#4a2e1f]">{label}</label>

      {/* Upload Box */}
      <label className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-[#ead7c5] rounded-lg cursor-pointer hover:bg-[#fdf7f2] transition">
        <span className="text-sm text-gray-600">
          Click to upload {multiple ? "images" : "image"}
        </span>

        <input
          type="file"
          {...props}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {/* PREVIEW */}
      {previews.length > 0 && (
        <div className="flex gap-3 flex-wrap mt-2">
          {previews.map((p, i) => (
            <div
              key={i}
              className="relative w-24 h-24 border rounded-lg overflow-hidden"
            >
              <img
                src={p.url}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="flex gap-2 items-center">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

function Tab({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-t ${
        active ? "bg-[#4a2e1f] text-white" : ""
      }`}
    >
      {children}
    </button>
  );
}
