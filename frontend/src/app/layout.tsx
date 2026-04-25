import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = "บล็อก";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "รวบรวมเรื่องราวและความรู้ที่น่าสนใจ",
  openGraph: {
    siteName: SITE_NAME,
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
