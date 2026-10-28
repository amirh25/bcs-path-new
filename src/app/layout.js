import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata = {
  title: "বিসিএস পাঠ - সিলেবাস-সাজানো বিসিএস প্রস্তুতি",
  description: "কালারফুল লেকচার নোটস, প্রগ্রেস ট্র্যাকার এবং মক টেস্ট",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.className} antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}