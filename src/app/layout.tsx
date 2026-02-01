import type { Metadata } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-devanagari",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://agrioindia.com"),
  title: "Agrio India Crop Science | Agrio Sampan kisan | भारतीय किसान की पहली पसंद",
  description:
    "Agrio Sampan kisan - Premium agrochemicals for higher yield. Empowering Indian farmers with high-quality crop solutions for a prosperous future.",
  keywords: [
    "agrio india",
    "crop science",
    "agriculture",
    "farming",
    "pesticides",
    "insecticides",
    "fungicides",
    "herbicides",
    "indian farmers",
    "कृषि",
    "खेती",
  ],
  authors: [{ name: "Agrio India Crop Science" }],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Agrio India Crop Science",
    description: "Agrio Sampan kisan - भारतीय किसान की पहली पसंद - Premium Agrochemicals for Higher Yield",
    type: "website",
    locale: "en_IN",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agrio India Crop Science",
    description: "Agrio Sampan kisan - भारतीय किसान की पहली पसंद - Premium Agrochemicals for Higher Yield",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${poppins.variable} ${notoSansDevanagari.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

