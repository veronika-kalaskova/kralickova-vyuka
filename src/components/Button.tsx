import React from "react";

interface Props {
  title: string;
  onClick?: () => void;
}

export default function Button({ title, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer rounded-lg bg-gray-100 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100"
    >
      {title}
    </button>
  );
}