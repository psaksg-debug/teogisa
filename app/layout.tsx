import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  creator: "퇴직하고 부자되기 편집실",
  publisher: SITE_NAME,
  category: "finance",
  robots: { index:true, follow:true, googleBot:{ index:true, follow:true, "max-image-preview":"large", "max-snippet":-1, "max-video-preview":-1 } },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "퇴직하고 부자되기 — 월 300만 원 수입 로드맵" }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images:["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
