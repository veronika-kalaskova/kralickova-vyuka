import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

// TODO: pridat favicon

const poppinsSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Králíčkova výuka jazyků",
  description: "Králíčkova výuka jazyků",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/prihlaseni");
  }
  
  // TODO: zmena kodu, ted uz uchovavam role primo v session
  let userRole = null;

  if (session?.user?.id) {
    const roles = await prisma.userRole.findMany({
      where: {
        userId: Number(session.user.id),
      },
      include: {
        role: true,
      },
    });

    userRole = roles.map((r) => r.role.name);
  }

  return (
    <html lang="cs" suppressHydrationWarning>
      <body
        className={`${poppinsSans.variable} flex h-screen flex-col antialiased`}
      >
        <Navbar session={session} userRole={userRole} />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
