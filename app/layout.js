import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] });

export const metadata = {
  title: "QuickCart - GreatStack",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
