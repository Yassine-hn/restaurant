import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Bahia Fast Food | Commande à Table par QR Code 🇩🇿",
  description:
    "Scannez le QR code sur votre table et commandez vos tacos algériens, chawarma et smash burgers préférés en direct.",
  keywords: [
    "restaurant",
    "fast food algérie",
    "tacos algérien",
    "chawarma alger",
    "qr code table ordering",
    "el bahia fast food",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d97706",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 selection:bg-amber-500 selection:text-white">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
