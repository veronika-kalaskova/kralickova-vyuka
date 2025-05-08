"use client";
import { Group, User, Course } from "@prisma/client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import CreateLectorModal from "../auth/CreateLectorModal";
import Link from "next/link";
import SearchInput from "../SearchInput";
import ReplaceLectorModal from "../forms/ReplaceLectorModal";

type LectorType = User & { CoursesTaught: Course[] };

interface Props {
  data: LectorType[];
  coursesWithoutLector: (Course & { group: Group | null })[];
  roles?: string[];
}

export default function TableLector({
  data,
  coursesWithoutLector,
  roles,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [deletedLectorId, setDeletedLectorId] = useState<number | null>(null);
  const [deletedLector, setDeletedLector] = useState<LectorType | null>(null);

  const isAdmin = roles?.includes("admin");

  const [selectedLector, setSelectedLector] = useState<LectorType | null>(null);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const openModalUpdate = (lector: LectorType) => {
    setSelectedLector(lector);
    setIsOpenUpdate(true);
  };

  const sortedData = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(
      query
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
    );
  };

  const filteredData = sortedData.filter((lector) =>
    `${lector.firstName} ${lector.lastName}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(searchQuery),
  );

  const handleDelete = (lector: LectorType) => {
    setDeletedLectorId(lector.id);
    setDeletedLector(lector)
    setIsReplaceModalOpen(true);

  };

  // const handleDelete = async (id: number) => {
  //   const confirmed = confirm("Opravdu chcete smazat tohoto lektora?");
  //   if (!confirmed) return;

  //   const response = await fetch("/api/user/delete", {
  //     method: "PUT",
  //     body: JSON.stringify({ id }),
  //     headers: { "Content-Type": "application/json" },
  //   });

  //   if (response.ok) {
  //     window.location.reload();
  //   } else {
  //     alert("Chyba při mazání lektora.");
  //   }
  // };

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="title mb-0">Přehled lektorů</h1>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
            >
              Přidat lektora
            </button>
          )}
        </div>
        <div className="">
          <SearchInput searchForQuery={handleSearch} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full rounded-md text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2">Jméno</th>
                <th className="hidden px-3 py-2 md:table-cell">Email</th>
                <th className="hidden px-3 py-2 md:table-cell">Kurzy</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((lector) => (
                <tr key={lector.id} className="odd:bg-gray-50 even:bg-white">
                  <td className="px-3 py-2 font-semibold">
                    {lector.firstName} {lector.lastName}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    {lector.email}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    <div className="flex max-w-[400px] flex-wrap gap-1">
                      {lector.CoursesTaught?.map((course, index) => (
                        <span
                          key={index}
                          className="inline-block rounded-full bg-[#FFE3C5] px-3 py-1 text-xs font-semibold"
                        >
                          {course.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Link href={`/seznam-lektoru/${lector.id}`}>
                        <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200">
                          <Image
                            src="/arrow-right.svg"
                            alt="profile"
                            width={20}
                            height={20}
                          />
                        </button>
                      </Link>

                      {isAdmin && (
                        <>
                          <button
                            className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200"
                            onClick={() => openModalUpdate(lector)}
                          >
                            <Image
                              src="/edit.svg"
                              alt="edit"
                              width={20}
                              height={20}
                            />
                          </button>

                          <button
                            className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-red-300"
                            onClick={() => {
                              handleDelete(lector);
                            }}
                          >
                            <Image
                              src="/trash.svg"
                              alt="delete"
                              width={20}
                              height={20}
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CreateLectorModal
        roleId={2}
        isOpen={isOpen}
        courses={coursesWithoutLector}
        onClose={() => setIsOpen(false)}
        type="create"
      />
      <CreateLectorModal
        roleId={2}
        isOpen={isOpenUpdate}
        courses={coursesWithoutLector}
        onClose={() => {
          setIsOpenUpdate(false);
        }}
        data={selectedLector}
        type="update"
      />
      <ReplaceLectorModal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        lectors={data.filter(
          (deletedLector) => deletedLector.id !== deletedLectorId,
        )}
        deletedLectorId={deletedLectorId}
      />
    </>
  );
}
