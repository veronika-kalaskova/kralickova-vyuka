import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import '../globals.css'

const poppinsSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body
        className={`${poppinsSans.variable} flex h-screen flex-col antialiased`}
      >
        <div>{children}</div>
      </body>
    </html>
  );
}
