import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata = {
  title: "Telegram Messenger Dashboard",
  description: "Reply to your Telegram bot's messages from a Messenger-style dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans bg-base text-text-primary antialiased">{children}</body>
    </html>
  );
}
