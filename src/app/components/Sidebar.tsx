import React from "react";
import SidebarItems from "./SidebarItems";

export default function Sidebar() {
  return (
    <div className="px-8 shadow-md mt-8 hidden sm:block">
      <ul className="flex flex-col h-full">
        <SidebarItems />
      </ul>
    </div>
  );
}
