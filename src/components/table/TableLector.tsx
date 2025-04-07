"use client";
import { Group, User, Course } from "@prisma/client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import CreateLectorModal from "../auth/CreateLectorModal";

// TODO: delete
// TODO: edit
// TODO: search input
// TODO: refresh po pridani lektora
// TODO: prejit na profil lektora link

interface Lector {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
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

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="title">Přehled lektorů</h1>

          <button
            onClick={() => openModal()}
            className="cursor-pointer rounded-lg bg-gray-100 px-3 py-3 font-medium text-gray-800 transition-all hover:bg-orange-400 hover:text-white"
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
            <tbody className="divide-y divide-orange-100">
              {data.map((lector) => (
                <tr key={lector.id} className="odd:bg-orange-50 even:bg-white">
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
                      <button className="hidden transform cursor-pointer rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold transition-all duration-300 hover:bg-orange-200 md:block">
                        Přejít na profil
                      </button>
                      <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200">
                        <Image
                          src="/edit.svg"
                          alt="edit"
                          width={20}
                          height={20}
                        />
                      </button>
                      <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-red-300">
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
      />
    </>
  );
}
