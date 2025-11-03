"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

 // Inside AppContextProvider
const fetchProducts = async () => {
  try {
    const token = await getToken();

    if (!token) {
      console.warn("⚠️ No token available, cannot fetch products.");
      return;
    }

    console.log("🔑 Token for API request:", token);

    // Make sure the API route matches your backend
    const res = await fetch("/api/product/seller-list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 Fetch /api/product/seller-list status:", res.status);

    // Parse JSON safely
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("❌ Failed to fetch products:", data);
      return;
    }

    // Ensure data is valid
    if (!data.success || !Array.isArray(data.products)) {
      console.warn("⚠️ Invalid product data:", data);
      return;
    }

    console.log("📦 Products fetched successfully:", data.products.length);
    setProducts(data.products);
  } catch (error) {
    console.error("💥 Error fetching products:", error);
  }
};


  // Detect Clerk user and role
  useEffect(() => {
    console.log("🟢 Clerk user loaded?", isLoaded, "clerkUser:", clerkUser);

    if (isLoaded && clerkUser) {
      setUser(clerkUser);

      // Prefer privateMetadata.role if set, fallback to clerkUser.role, default to 'user'
      const role =
        clerkUser?.privateMetadata?.role ||
        clerkUser?.publicMetadata?.role ||
        clerkUser?.role ||
        "user";

      console.log("👤 Detected user role:", role);

      setIsSeller(role === "seller");

      // Fetch products only for seller
      if (role === "seller") fetchProducts();
    }
  }, [isLoaded, clerkUser]);

  // Cart functions
  const addToCart = (productId) => {
    if (cart.find((item) => item._id === productId)) return;
    const product = products.find((p) => p._id === productId);
    if (product) setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  console.log(
    "🟢 Context state:",
    "user:",
    user ? user.email : null,
    "isSeller:",
    isSeller,
    "products:",
    products.length
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isSeller,
        getToken,
        products,
        cart,
        addToCart,
        removeFromCart,
        router,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
