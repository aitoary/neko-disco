import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NEKO DISCO｜猫とあそぶ、夜のひみつ基地",
  description:
    "人気ランキングから12猫種が集合。猫だらけのディスコで、イラストをタップして見た目や性格を知ろう。触ってあそべる、猫種と生態の図鑑。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
