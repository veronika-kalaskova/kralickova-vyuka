"use client";
import React, { useState } from "react";
import Image from "next/image";
import SidebarItems from "./SidebarItems";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-8 shadow-sm">
      {/* LOGO */}
      <Link href="/" className="hidden items-center gap-2 sm:flex">
        <Image src="logo.svg" alt="logo" height={110} width={75} />
        <h1 className="font-semibold">Králíčková výuka jazyků</h1>
      </Link>

      {/* USER */}
      <p className="orange-background font-semibold">Jméno uživatele</p>

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
            className="fixed top-0 right-0 z-20 mt-8 flex h-full w-3/5 flex-col bg-white px-8 shadow-md"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="cursor-pointer self-end"
            >
              <Image src="close.svg" alt="close" width={30} height={30} />
            </button>
            <ul className="mt-10 flex h-[85%] flex-col">
              <SidebarItems closeMenu={closeMenu} />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
