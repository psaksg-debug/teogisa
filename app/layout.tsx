import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://retire-rich-lab.sgk1.chatgpt.site"),
  title: { default: "퇴직하고 부자되기", template: "%s | 퇴직하고 부자되기" },
  description: "퇴직 이후의 돈·일·부업·재테크를 연구합니다. 월 300만 원 현금흐름을 만드는 실전 기록.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "퇴직하고 부자되기",
    description: "퇴직 이후의 돈·일·부업·재테크를 연구합니다",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "퇴직하고 부자되기 — 월 300만 원 수입 로드맵" }],
  },
  twitter: { card: "summary_large_image", title: "퇴직하고 부자되기", description: "퇴직 이후의 돈·일·부업·재테크를 연구합니다", images:["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
