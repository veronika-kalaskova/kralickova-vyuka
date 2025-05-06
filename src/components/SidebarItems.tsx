"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type SidebarItemsProps = {
  closeMenu?: () => void;
};

export default function SidebarItems({ closeMenu }: SidebarItemsProps) {
  const currentPath = usePathname();

  const pages = [
    { name: "Domov", path: "/" },
    { name: "Můj profil", path: "/muj-profil" },
    { name: "Seznam lektorů", path: "/seznam-lektoru" },
    { name: "Seznam studentů", path: "/seznam-studentu" },
    { name: "Seznam kurzů", path: "/seznam-kurzu" },
  ];

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const handleCloseMenu = () => {
    if (closeMenu) {
      closeMenu();
    }
  };

  return (
    <>
      {pages.map((page) => (
        <Link
          href={page.path}
          key={page.path}
          className={
            isActive(page.path) ? "sidebar-item active" : "sidebar-item"
          }
          onClick={handleCloseMenu}
        >
          {page.name}
        </Link>
      ))}
      <button
        onClick={() => signOut()}
        className="sidebar-item mt-auto text-center"
      >
        Odhlásit se
      </button>
    </>
  );
}
