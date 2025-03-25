import React from "react";

interface props {
  title: string;
}

export default function Button({ title }: props) {
  return (
    <button className="w-full cursor-pointer rounded-lg bg-gray-100 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100">
      {title}
    </button>
  );
}
