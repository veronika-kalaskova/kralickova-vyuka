"use client";
import React, { useState } from "react";
import Image from "next/image";
import SidebarItems from "./SidebarItems";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Session } from "next-auth";

interface Props {
  session: Session | null;
  userRole: string[] | null;
}

export default function Navbar({ session, userRole }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="z-10 flex items-center justify-between p-4 shadow-xs">
      {/* LOGO */}
      <Link href="/" className="hidden items-center gap-2 sm:flex">
        <Image src="logo.svg" alt="logo" height={110} width={75} />
        <h1 className="font-bold">Králíčková výuka jazyků</h1>
      </Link>

      {/* USER */}
      <div className="flex items-center gap-2">
        {session?.user ? (
          <p className="font-bold">
            {session.user.firstName} {session.user.lastName}
          </p>
        ) : (
          <p className="font-bold">Nepřihlášený uživatel</p>
        )}
        {userRole?.map((role) => (
          <span key={role} className="orange-background text-sm font-semibold">
            {role}
          </span>
        ))}
      </div>

      {/* HAMBURGER MENU */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="block cursor-pointer sm:hidden"
      >
        <Image src="menu.svg" alt="menu" width={30} height={30} />
      </button>

      {/* NAVIGATION ON MOBILE */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ style: "ease-in-out", duration: 0.3 }}
            className="fixed top-0 right-0 z-20 flex h-full w-3/5 flex-col bg-[#FAF8F7] px-8 pt-8 shadow-md"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="cursor-pointer self-end"
            >
              <Image src="close.svg" alt="close" width={30} height={30} />
            </button>
            <ul className="mt-10 flex h-[90%] flex-col">
              <SidebarItems closeMenu={closeMenu} />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
