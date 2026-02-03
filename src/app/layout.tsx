import type { Metadata } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// JSON-LD Structured Data for Organization, Products, and Local Business
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Organization Schema
    {
      "@type": ["Organization", "Corporation", "Brand"],
      "@id": "https://www.agrioindiacropsciences.com/#organization",
      name: "Agrio India Crop Science",
      legalName: "Agrio India Crop Science Pvt Ltd",
      alternateName: [
        "Agrio Sampan Kisan",
        "Agrio India",
        "एग्रियो इंडिया क्रॉप साइंस",
        "एग्रियो संपन किसान",
        "Kheticare",
        "खेतीकेयर",
      ],
      url: "https://www.agrioindiacropsciences.com",
      logo: {
        "@type": "ImageObject",
        "@id": "https://www.agrioindiacropsciences.com/#logo",
        url: "https://www.agrioindiacropsciences.com/logo.svg",
        contentUrl: "https://www.agrioindiacropsciences.com/logo.svg",
        caption: "Agrio India Crop Science Logo",
      },
      image: [
        "https://www.agrioindiacropsciences.com/home.png",
        "https://www.agrioindiacropsciences.com/logo.svg",
      ],
      description: "Agrio India Crop Science - Agrio Sampan Kisan, भारतीय किसान की पहली पसंद। India's leading agrochemical company providing premium quality insecticides, fungicides, herbicides, and plant growth regulators for higher crop yield.",
      slogan: "भारतीय किसान की पहली पसंद - Agrio Sampan Kisan",
      foundingDate: "2020",
      foundingLocation: "Uttar Pradesh, India",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "E-31, Industrial Area, Gopalpur",
        addressLocality: "Sikandrabad",
        addressRegion: "Uttar Pradesh",
        postalCode: "201314",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "28.490681",
        longitude: "77.6550442",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
      ],
      sameAs: [
        "https://www.instagram.com/kheticare___",
        "https://www.facebook.com/kheticare",
        "https://youtube.com/@kheticare",
      ],
      knowsAbout: [
        "Agrochemicals",
        "Insecticides",
        "Fungicides",
        "Herbicides",
        "Plant Growth Regulators",
        "Crop Protection",
        "Agriculture",
        "Farming",
        "Indian Agriculture",
      ],
    },
    // WebSite Schema with SearchAction
    {
      "@type": "WebSite",
      "@id": "https://www.agrioindiacropsciences.com/#website",
      url: "https://www.agrioindiacropsciences.com",
      name: "Agrio India Crop Science",
      alternateName: "Agrio Sampan Kisan",
      publisher: {
        "@id": "https://www.agrioindiacropsciences.com/#organization",
      },
      inLanguage: ["en-IN", "hi-IN"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.agrioindiacropsciences.com/products?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    // WebPage Schema
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
      description: "Premium agrochemicals for Indian farmers. Buy Agrio Formula, Agrio Chakravyuh, Agrio Rocket, Agrio Hercules, Agrio Topis, Agrio Unicorn. Quality insecticides, fungicides, herbicides for higher crop yield.",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.agrioindiacropsciences.com",
          },
        ],
      },
    },
    // Product List Schema
    {
      "@type": "ItemList",
      "@id": "https://www.agrioindiacropsciences.com/#products",
      name: "Agrio India Best Selling Products",
      description: "Premium agrochemical products by Agrio India Crop Science",
      numberOfItems: 6,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Product",
            name: "Agrio Unicorn",
            description: "Sodium Para-Nitro Phenolate 0.3% SL - Premium plant growth regulator for better crop yield. Dosage: 250ml/Acre",
            image: "https://www.agrioindiacropsciences.com/product1.JPG",
            brand: {
              "@type": "Brand",
              name: "Agrio India",
            },
            offers: {
              "@type": "Offer",
              price: "500",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://www.agrioindiacropsciences.com/#organization",
              },
            },
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Product",
            name: "Agrio Rocket",
            description: "Triacontanol 0.05% GR - High-quality plant growth regulator. Dosage: 4kg/Acre",
            image: "https://www.agrioindiacropsciences.com/product2.jpeg",
            brand: {
              "@type": "Brand",
              name: "Agrio India",
            },
            offers: {
              "@type": "Offer",
              price: "680",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://www.agrioindiacropsciences.com/#organization",
              },
            },
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "Product",
            name: "Agrio Topis",
            description: "Topramezone 33.6% SC - Effective herbicide for weed control. Dosage: 30ml/Acre",
            image: "https://www.agrioindiacropsciences.com/product3.PNG",
            brand: {
              "@type": "Brand",
              name: "Agrio India",
            },
            offers: {
              "@type": "Offer",
              price: "1200",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://www.agrioindiacropsciences.com/#organization",
              },
            },
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "Product",
            name: "Agrio Hercules",
            description: "Halosulfuron Methyl 75% WG - Powerful herbicide for crop protection. Dosage: 36gm/Acre",
            image: "https://www.agrioindiacropsciences.com/product4.JPG",
            brand: {
              "@type": "Brand",
              name: "Agrio India",
            },
            offers: {
              "@type": "Offer",
              price: "1100",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://www.agrioindiacropsciences.com/#organization",
              },
            },
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@type": "Product",
            name: "Agrio Chakravyuh",
            description: "Azoxystrobin 2.5% + Thiophanate Methyl 11.25% + Thiamethoxam 25% FS - Advanced seed treatment solution",
            image: "https://www.agrioindiacropsciences.com/product5.PNG",
            brand: {
              "@type": "Brand",
              name: "Agrio India",
            },
            offers: {
              "@type": "Offer",
              price: "1500",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://www.agrioindiacropsciences.com/#organization",
              },
            },
          },
        },
        {
          "@type": "ListItem",
          position: 6,
          item: {
            "@type": "Product",
            name: "Agrio Formula",
            description: "Chlorantraniliprole 18.5% SC - Premium insecticide for effective pest control",
            image: "https://www.agrioindiacropsciences.com/product6.PNG",
            brand: {
              "@type": "Brand",
              name: "Agrio India",
            },
            offers: {
              "@type": "Offer",
              price: "1500",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://www.agrioindiacropsciences.com/#organization",
              },
            },
          },
        },
      ],
    },
    // Local Business Schema
    {
      "@type": "LocalBusiness",
      "@id": "https://www.agrioindiacropsciences.com/#localbusiness",
      name: "Agrio India Crop Science",
      image: "https://www.agrioindiacropsciences.com/home.png",
      address: {
        "@type": "PostalAddress",
        streetAddress: "E-31, Industrial Area, Gopalpur",
        addressLocality: "Sikandrabad",
        addressRegion: "Uttar Pradesh",
        postalCode: "201314",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "28.490681",
        longitude: "77.6550442",
      },
      url: "https://www.agrioindiacropsciences.com",
      priceRange: "₹₹",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
    // FAQ Schema for common questions
    {
      "@type": "FAQPage",
      "@id": "https://www.agrioindiacropsciences.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Agrio India Crop Science?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Agrio India Crop Science is a leading agrochemical company in India, known as 'Agrio Sampan Kisan' - भारतीय किसान की पहली पसंद. We provide premium quality insecticides, fungicides, herbicides, and plant growth regulators for higher crop yield.",
          },
        },
        {
          "@type": "Question",
          name: "What products does Agrio India offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Agrio India offers premium agrochemical products including Agrio Formula, Agrio Chakravyuh, Agrio Rocket, Agrio Hercules, Agrio Topis, and Agrio Unicorn. These include insecticides, fungicides, herbicides, and plant growth regulators.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I buy Agrio India products?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can buy Agrio India products from our authorized distributors across India. Visit our website agrioindiacropsciences.com to find a distributor near you using your pincode.",
          },
        },
      ],
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
  manifest: "/site.webmanifest",
  title: {
    default: "Agrio India Crop Science | Agrio Sampan Kisan | भारतीय किसान की पहली पसंद | Best Agrochemicals",
    template: "%s | Agrio India Crop Science - Agrio Sampan Kisan",
  },
  description:
    "Agrio India Crop Science - Agrio Sampan Kisan (एग्रियो संपन किसान), भारतीय किसान की पहली पसंद। Buy premium agrochemicals - Agrio Formula, Agrio Chakravyuh, Agrio Rocket, Agrio Hercules, Agrio Topis, Agrio Unicorn. Best insecticides, fungicides, herbicides for higher crop yield in India.",
  keywords: [
    // Brand Keywords
    "agrio india",
    "agrio india crop science",
    "agrioindiacropsciences",
    "agrio sampan kisan",
    "एग्रियो इंडिया",
    "एग्रियो संपन किसान",
    "kheticare",
    "खेतीकेयर",
    // Product Keywords
    "agrio formula",
    "agrio chakravyuh",
    "agrio rocket",
    "agrio hercules",
    "agrio topis",
    "agrio unicorn",
    "agrio formula price",
    "agrio chakravyuh price",
    "agrio rocket price",
    "agrio hercules price",
    // Technical Keywords
    "chlorantraniliprole 18.5 sc",
    "topramezone 33.6 sc",
    "halosulfuron methyl 75 wg",
    "triacontanol 0.05 gr",
    "sodium para nitro phenolate",
    "azoxystrobin thiophanate methyl thiamethoxam",
    // Category Keywords
    "insecticides india",
    "fungicides india",
    "herbicides india",
    "plant growth regulator",
    "agrochemicals india",
    "pesticides india",
    "crop protection",
    "seed treatment",
    // Hindi Keywords
    "कृषि",
    "खेती",
    "किसान",
    "कीटनाशक",
    "फफूंदनाशक",
    "खरपतवारनाशक",
    "फसल सुरक्षा",
    // Location Keywords
    "agrochemicals uttar pradesh",
    "agrochemicals delhi",
    "agrochemicals punjab",
    "agrochemicals haryana",
    "agrochemicals bihar",
    // General Keywords
    "agriculture",
    "farming",
    "indian farmers",
    "crop yield",
    "best agrochemicals india",
    "buy pesticides online",
  ],
  authors: [{ name: "Agrio India Crop Science" }],
  creator: "Agrio India Crop Science",
  publisher: "Agrio India Crop Science",
  category: "Agriculture",
  classification: "Agrochemicals",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/home.png", type: "image/png", sizes: "512x512" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Agrio India Crop Science | Agrio Sampan Kisan - भारतीय किसान की पहली पसंद",
    description: "Buy premium agrochemicals - Agrio Formula, Agrio Chakravyuh, Agrio Rocket, Agrio Hercules, Agrio Topis, Agrio Unicorn. Best insecticides, fungicides, herbicides for Indian farmers. एग्रियो संपन किसान - भारतीय किसान की पहली पसंद।",
    type: "website",
    locale: "en_IN",
    url: "https://www.agrioindiacropsciences.com",
    siteName: "Agrio India Crop Science",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 630,
        alt: "Agrio India Crop Science - Agrio Sampan Kisan - Premium Agrochemicals for Indian Farmers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@agrioindiacrop",
    title: "Agrio India Crop Science | Agrio Sampan Kisan",
    description: "एग्रियो संपन किसान - भारतीय किसान की पहली पसंद। Buy Agrio Formula, Agrio Chakravyuh, Agrio Rocket, Agrio Hercules - Premium Agrochemicals for Higher Yield",
    images: ["/home.png"],
    creator: "@agrioindiacrop",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  alternates: {
    canonical: "https://www.agrioindiacropsciences.com",
    languages: {
      "en-IN": "https://www.agrioindiacropsciences.com",
      "hi-IN": "https://www.agrioindiacropsciences.com",
    },
  },
  other: {
    "geo.region": "IN-UP",
    "geo.placename": "Sikandrabad, Uttar Pradesh",
    "geo.position": "28.490681;77.6550442",
    "ICBM": "28.490681, 77.6550442",
    "revisit-after": "7 days",
    "rating": "General",
    "distribution": "Global",
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

