/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "**",
      },
    ],
  },

  // Prevent Next.js from prematurely aborting slow API routes
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // allow larger uploads (adjust as needed)
    },
  },

  // Optional: helps with longer-running serverless routes on Vercel
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

export default nextConfig;
