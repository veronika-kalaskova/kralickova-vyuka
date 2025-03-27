import React from "react";
import SidebarItems from "./SidebarItems";


export default function Sidebar() {
  return (
    <div className="hidden bg-[#FAF8F7] px-8 pt-8 sm:block">
      <ul className="flex h-full flex-col">
        <SidebarItems />
      </ul>
    </div>
  );
}
