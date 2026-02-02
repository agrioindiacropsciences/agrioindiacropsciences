import type { Metadata } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// JSON-LD Structured Data for Organization (helps show logo in Google search)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.agrioindiacropsciences.com/#organization",
      name: "Agrio India Crop Science",
      alternateName: ["Agrio Sampan Kisan", "एग्रियो इंडिया क्रॉप साइंस"],
      url: "https://www.agrioindiacropsciences.com",
      logo: {
        "@type": "ImageObject",
        "@id": "https://www.agrioindiacropsciences.com/#logo",
        url: "https://www.agrioindiacropsciences.com/logo.svg",
        contentUrl: "https://www.agrioindiacropsciences.com/logo.svg",
        caption: "Agrio India Crop Science Logo",
      },
      image: "https://www.agrioindiacropsciences.com/logo.svg",
      description: "Agrio India Crop Science - भारतीय किसान की पहली पसंद। Premium agrochemicals for higher yield.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "E-31, Industrial Area, Gopalpur",
        addressLocality: "Sikandrabad",
        addressRegion: "Uttar Pradesh",
        postalCode: "201314",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
      },
      sameAs: [
        "https://www.instagram.com/kheticare___",
        "https://www.facebook.com/kheticare",
        "https://youtube.com/@kheticare",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.agrioindiacropsciences.com/#website",
      url: "https://www.agrioindiacropsciences.com",
      name: "Agrio India Crop Science",
      publisher: {
        "@id": "https://www.agrioindiacropsciences.com/#organization",
      },
      inLanguage: ["en-IN", "hi-IN"],
    },
    {
      "@type": "WebPage",
      "@id": "https://www.agrioindiacropsciences.com/#webpage",
      url: "https://www.agrioindiacropsciences.com",
      name: "Agrio India Crop Science | Agrio Sampan Kisan | भारतीय किसान की पहली पसंद",
      isPartOf: {
        "@id": "https://www.agrioindiacropsciences.com/#website",
      },
      about: {
        "@id": "https://www.agrioindiacropsciences.com/#organization",
      },
      description: "Premium agrochemicals for Indian farmers. Quality insecticides, fungicides, herbicides for higher yield.",
    },
  ],
};

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
  metadataBase: new URL("https://www.agrioindiacropsciences.com"),
  title: {
    default: "Agrio India Crop Science | Agrio Sampan Kisan | भारतीय किसान की पहली पसंद",
    template: "%s | Agrio India Crop Science",
  },
  description:
    "Agrio India Crop Science - Agrio Sampan Kisan, भारतीय किसान की पहली पसंद। Premium agrochemicals for higher yield. Quality insecticides, fungicides, herbicides for Indian farmers.",
  keywords: [
    "agrio india",
    "agrio india crop science",
    "agrioindiacropsciences",
    "agrio sampan kisan",
    "crop science",
    "agriculture",
    "farming",
    "pesticides",
    "insecticides",
    "fungicides",
    "herbicides",
    "indian farmers",
    "agrochemicals",
    "कृषि",
    "खेती",
    "किसान",
    "agrio formula",
    "agrio chakravyuh",
    "agrio rocket",
    "agrio hercules",
    "agrio topis",
    "agrio unicorn",
  ],
  authors: [{ name: "Agrio India Crop Science" }],
  creator: "Agrio India Crop Science",
  publisher: "Agrio India Crop Science",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Agrio India Crop Science | Agrio Sampan Kisan",
    description: "Agrio Sampan Kisan - भारतीय किसान की पहली पसंद - Premium Agrochemicals for Higher Yield. Quality crop solutions for Indian farmers.",
    type: "website",
    locale: "en_IN",
    url: "https://www.agrioindiacropsciences.com",
    siteName: "Agrio India Crop Science",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 630,
        alt: "Agrio India Crop Science - Premium Agrochemicals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agrio India Crop Science | Agrio Sampan Kisan",
    description: "Agrio Sampan Kisan - भारतीय किसान की पहली पसंद - Premium Agrochemicals for Higher Yield",
    images: ["/home.png"],
    creator: "@agrioindiacrop",
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code here
  },
  alternates: {
    canonical: "https://www.agrioindiacropsciences.com",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

