"use client";
import { Group, User, Course } from "@prisma/client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import CreateLectorModal from "../auth/CreateLectorModal";

// TODO: search input
// TODO: prejit na profil lektora link
// TODO: pagination

interface Lector {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  CoursesTaught?: Course[];
}

interface Props {
  data: Lector[];
  coursesWithoutLector: (Course & { group: Group | null })[];
}

export default function Table({ data, coursesWithoutLector }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const openModalUpdate = (lector: Lector) => {
    setSelectedLector(lector);
    setIsOpenUpdate(true);
  };

  const [selectedLector, setSelectedLector] = useState<Lector | null>(null);

  const sortedData = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Opravdu chceš smazat tohoto lektora?");
    if (!confirmed) return;
  
    const response = await fetch("/api/user/delete", {
      method: "PUT",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
  
    if (response.ok) {
      window.location.reload();
    } else {
      alert("Chyba při mazání lektora.");
    }
  };

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="title mb-0">Přehled lektorů</h1>

          <button
            onClick={() => openModal()}
            className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
          >
            Přidat lektora
          </button>
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
              {sortedData.map((lector) => (
                <tr key={lector.id} className="odd:bg-gray-50 even:bg-white">
                  <td className="px-3 py-2 font-semibold">
                    {lector.firstName} {lector.lastName}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    {lector.email}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    <div className="flex flex-wrap gap-1">
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
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200 md:hidden">
                        <Image
                          src="/user-circle.svg"
                          alt="profile"
                          width={20}
                          height={20}
                        />
                      </button>
                      <button className="hidden transform cursor-pointer rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold transition-all duration-300 hover:bg-[#FFE3C5] md:block">
                        Přejít na profil
                      </button>
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
                      <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-red-300" onClick={() => {handleDelete(lector.id)}}>
                        <Image
                          src="/trash.svg"
                          alt="delete"
                          width={20}
                          height={20}
                        />
                      </button>
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
        onClose={() => {setIsOpenUpdate(false)}}
        data={selectedLector}
        type="update"
      />
    </>
  );
}
