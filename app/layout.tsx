import type { Metadata, Viewport } from "next";
import VisitorTracker from "@/components/visitor-tracker";
import "./fonts.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psht-smkndu.vercel.app";

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PSHT SMKN Darul Ulum Muncar - Portal Resmi",
    template: "%s | PSHT SMKN Darul Ulum Muncar",
  },
  description:
    "Website resmi Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar, Banyuwangi. Pusat informasi latihan, keorganisasian, artikel, pengumuman, dan pendaftaran anggota baru.",
  keywords: [
    "PSHT",
    "Persaudaraan Setia Hati Terate",
    "SMKN Darul Ulum Muncar",
    "PSHT Banyuwangi",
    "Pencak Silat",
    "Silat SMKN Darul Ulum",
    "Ekstrakurikuler Silat",
    "Muncar",
  ],
  authors: [{ name: "PSHT SMKN Darul Ulum Muncar" }],
  creator: "PSHT SMKN Darul Ulum Muncar",
  publisher: "PSHT SMKN Darul Ulum Muncar",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PSHT SMKNDU",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=laravel-transparent-1", sizes: "any" },
      { url: "/favicon-32x32.png?v=laravel-transparent-1", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=laravel-transparent-1", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png?v=laravel-transparent-1", type: "image/png" },
    ],
    shortcut: ["/favicon.ico?v=laravel-transparent-1"],
    apple: [
      { url: "/apple-touch-icon.png?v=laravel-transparent-1", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "PSHT SMKN Darul Ulum Muncar - Portal Resmi",
    description:
      "Website resmi Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar, Banyuwangi. Pusat informasi latihan, keorganisasian, artikel, pengumuman, dan pendaftaran.",
    url: siteUrl,
    siteName: "PSHT SMKN Darul Ulum Muncar",
    images: [
      {
        url: "/sh-emblem.png",
        width: 512,
        height: 512,
        alt: "Logo Resmi PSHT Rayon SMKN Darul Ulum Muncar",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PSHT SMKN Darul Ulum Muncar - Portal Resmi",
    description:
      "Website resmi Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar, Banyuwangi.",
    images: ["/sh-emblem.png"],
  },
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
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  "name": "Persaudaraan Setia Hati Terate Rayon SMKN Darul Ulum Muncar",
  "alternateName": ["PSHT SMKN Darul Ulum", "PSHT Rayon SMKNDU", "PSHT SMKNDU"],
  "url": siteUrl,
  "logo": `${siteUrl}/sh-emblem.png`,
  "image": `${siteUrl}/sh-emblem.png`,
  "description":
    "Portal resmi Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar, Banyuwangi. Informasi latihan, keorganisasian, pendaftaran siswa baru, dan prestasi pencak silat.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "JL. KH. Askandar Km.2 Wringinputih",
    "addressLocality": "Muncar",
    "addressRegion": "Banyuwangi, Jawa Timur",
    "postalCode": "68472",
    "addressCountry": "ID"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+62-823-3818-4217",
    "contactType": "Informasi & Pendaftaran",
    "availableLanguage": ["id", "Indonesian"]
  },
  "sameAs": [
    "https://instagram.com/psht.smkndu",
    "https://www.tiktok.com/@candratokez1",
    "https://wa.me/6282338184217"
  ]
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PSHT SMKN Darul Ulum Muncar",
  "url": siteUrl,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${siteUrl}/artikel?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico?v=laravel-transparent-1" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png?v=laravel-transparent-1" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png?v=laravel-transparent-1" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=laravel-transparent-1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
