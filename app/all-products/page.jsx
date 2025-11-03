'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { toast } from "react-hot-toast";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all products from API
  const fetchProducts = async () => {
    console.log("📡 Fetching all products from /api/product/list...");
    try {
      const response = await axios.get("/api/product/list", {
        headers: { "Cache-Control": "no-cache" },
      });

      console.log("📥 Raw API Response:", response);

      const { data } = response;

      // Handle unexpected HTML (usually a 404 or server error)
      if (typeof data !== "object") {
        console.error("❌ Invalid JSON response (HTML detected):", data);
        toast.error("Server returned invalid data. Check API route.");
        return;
      }

      if (data.success && Array.isArray(data.products)) {
        console.log(`✅ Loaded ${data.products.length} products`);
        setProducts(data.products);
      } else {
        console.warn("⚠️ API did not return a product list:", data.message);
        toast.error(data.message || "Failed to load products");
      }
    } catch (error) {
      console.error("💥 Error fetching products:", error);
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🧠 Debug logs
  console.log("🎨 Rendering AllProducts — loading:", loading, "products:", products.length);

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-screen">
        <div className="flex flex-col items-end pt-12 w-full">
          <p className="text-2xl font-medium text-gray-800">All Products</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center w-full py-20">
            <Loading />
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center w-full py-20 text-gray-500">
            No products available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 pb-14 w-full">
            {products.map((product, index) => (
              <ProductCard key={product._id || index} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AllProducts;
