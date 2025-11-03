'use client';
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const ProductForm = ({ mode = "add", productId }) => {
  const { getToken } = useAppContext();

  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tote Bags");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [loading, setLoading] = useState(mode === "edit");

  // Fetch existing product data for editing
  useEffect(() => {
    if (mode === "edit" && productId) {
      const fetchProduct = async () => {
        try {
          const token = await getToken();
          const { data } = await axios.get(`/api/product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const product = data.product;

          setTitle(product.title || "");
          setDescription(product.description || "");
          setCategory(product.category || "Tote Bags");
          setPrice(product.price?.toString() || "");
          setOfferPrice(product.offerPrice?.toString() || "");
          setExistingImages(product.images || []);
        } catch (error) {
          console.error(error);
          toast.error("Failed to load product details");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [mode, productId, getToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "add" && !files.length) {
      return toast.error("Please upload at least one product image");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);
    files.forEach((file) => formData.append("images", file));
    formData.append("existingImages", JSON.stringify(existingImages));

    try {
      const token = await getToken();
      if (!token) return toast.error("Missing auth token");

      let response;
      if (mode === "add") {
        response = await axios.post("/api/product/add", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.put(`/api/product/${productId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast.success(mode === "add" ? "Product added successfully!" : "Product updated successfully!");
        if (mode === "add") {
          setFiles([]);
          setExistingImages([]);
          setTitle("");
          setDescription("");
          setCategory("Tote Bags");
          setPrice("");
          setOfferPrice("");
        }
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <p className="p-4">Loading product...</p>;

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-start items-center pt-10 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-lg p-6 bg-white rounded shadow-md">
        
        {/* Existing Images */}
        <div>
          <p className="text-base font-medium mb-2">Product Images</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img, index) => (
              <div key={index} className="relative">
                <Image src={img} alt={`Existing ${index + 1}`} width={100} height={100} className="rounded border object-cover"/>
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                >
                  X
                </button>
              </div>
            ))}

            {/* New Images */}
            {[...Array(4)].map((_, index) => (
              <label key={index} className="cursor-pointer">
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const updatedFiles = [...files];
                    updatedFiles[index] = e.target.files[0];
                    setFiles(updatedFiles);
                  }}
                />
                <Image
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt="Upload"
                  width={100}
                  height={100}
                  className="rounded border object-cover"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label htmlFor="product-title" className="text-base font-medium">Product Title</label>
          <input
            id="product-title"
            type="text"
            placeholder="Type here"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="outline-none py-2 px-3 rounded border border-gray-400"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="product-description" className="text-base font-medium">Product Description</label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Type here"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="outline-none py-2 px-3 rounded border border-gray-400 resize-none"
            required
          />
        </div>

        {/* Category, Price, Offer Price */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="category" className="text-base font-medium">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="outline-none py-2 px-3 rounded border border-gray-400"
            >
              <option value="Tote Bags">Tote Bags</option>
              <option value="Shoulder Bags">Shoulder Bags</option>
              <option value="Crossbody Bags">Crossbody Bags</option>
              <option value="Satchel Bags">Satchel Bags</option>
              <option value="Bucket Bags">Bucket Bags</option>
              <option value="Hobo Bags">Hobo Bags</option>
              <option value="Clutches & Evening Bags">Clutches & Evening Bags</option>
              <option value="Belt Bags / Waist Bags">Belt Bags / Waist Bags</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="price" className="text-base font-medium">Product Price</label>
            <input
              id="price"
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="outline-none py-2 px-3 rounded border border-gray-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="offerPrice" className="text-base font-medium">Offer Price</label>
            <input
              id="offerPrice"
              type="number"
              placeholder="0"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="outline-none py-2 px-3 rounded border border-gray-400"
              required
            />
          </div>
        </div>

        <button type="submit" className="px-6 py-2.5 bg-orange-600 text-white rounded font-medium">
          {mode === "add" ? "ADD" : "UPDATE"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
