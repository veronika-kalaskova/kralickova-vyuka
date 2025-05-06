"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Props {
  searchForQuery: (query: string) => void;
}

export default function SearchInput({ searchForQuery }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // hodnota z inputu se da do value
    searchForQuery(value);
  };

  return (
    <div className="relative mb-8 w-full md:w-80">
      <input
        type="text"
        onChange={handleChange}
        placeholder="Hledat..."
        className="w-full rounded-md bg-gray-100 px-4 py-3 pr-10"
      />
      <button
        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
      >
        <Image src="/search.svg" width={20} height={20} alt="search" />
      </button>
    </div>
  );
}
