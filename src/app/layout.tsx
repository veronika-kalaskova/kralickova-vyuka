import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const poppinsSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Králíčkova výuka jazyků",
  description: "Králíčkova výuka jazyků",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={`${poppinsSans.variable} antialiased h-screen flex flex-col`}>
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
