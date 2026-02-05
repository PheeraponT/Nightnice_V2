import type { Metadata } from "next";
import { Kanit, Prompt, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { ToastProvider } from "@/components/ui/Toast";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { GTMScript, GTMNoScript } from "@/components/analytics/GTMScript";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/schema";
import "./globals.css";

// Display font for headings - supports Thai
const kanit = Kanit({
  variable: "--font-display",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body font - supports Thai, excellent readability
const prompt = Prompt({
  variable: "--font-body",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Monospace font for code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - ค้นหาร้านกลางคืนในประเทศไทย`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "ร้านกลางคืน",
    "บาร์",
    "ผับ",
    "ร้านเหล้า",
    "ร้านอาหารกลางคืน",
    "nightlife",
    "Thailand",
    "ไทย",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ค้นหาร้านกลางคืนในประเทศไทย`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ค้นหาร้านกลางคืนในประเทศไทย`,
    description: SITE_DESCRIPTION,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate organization and website schemas for root layout
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="th">
      <head>
        {/* T159: Google Tag Manager */}
        <GTMScript />
        {/* Google Analytics 4 */}
        <GoogleAnalytics />
        {/* Organization and WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body
        className={`${kanit.variable} ${prompt.variable} ${jetbrainsMono.variable} antialiased bg-night text-surface-light min-h-screen flex flex-col font-body`}
      >
        {/* T159: GTM NoScript fallback */}
        <GTMNoScript />
        <QueryProvider>
          <FirebaseAuthProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </FirebaseAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
