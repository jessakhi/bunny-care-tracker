import "./globals.css";
import { Jersey_15 } from "next/font/google";

const jersey = Jersey_15({ subsets: ["latin"], weight: "400" });

export const metadata = { title: "Bunny Care", description: "Welcome" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jersey.className}>{children}</body>
    </html>
  );
}
