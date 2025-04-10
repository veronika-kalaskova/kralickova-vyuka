"use client";
import { Group, User, Course, StudentGroup } from "@prisma/client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import CreateLectorModal from "../auth/CreateLectorModal";
import Link from "next/link";
import SearchInput from "../SearchInput";
import CreateStudentModal from "../auth/CreateStudentModal";
import CreateUpdateCourseModal from "../forms/CreateUpdateCourseModal";
import { select } from "framer-motion/client";

// TODO: pagination

interface Props {
  data: (Course & { teacher: User | null } & { group: Group | null })[];
  lectors: User[];
  roles?: string[];
}

export default function TableCourse({ data, roles, lectors }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const isAdmin = roles?.includes("admin");

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [isOpenUpdate, setIsOpenUpdate] = useState(false);

  const openModalUpdate = (course: Course) => {
    setSelectedCourse(course);
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

  const filteredData = sortedData.filter((course) =>
    `${course.name}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(searchQuery),
  );

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Opravdu chcete smazat tento kurz?");
    if (!confirmed) return;

    const response = await fetch("/api/course/delete", {
      method: "PUT",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Chyba při mazání kurzu.");
    }
  };

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="title mb-0">Přehled kurzů</h1>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
            >
              Přidat kurz
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
                <th className="hidden px-3 py-2 md:table-cell">Typ</th>
                <th className="hidden px-3 py-2 md:table-cell">Lektor</th>
                <th className="hidden px-3 py-2 md:table-cell">Skupina</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((course) => (
                <tr key={course.id} className="odd:bg-gray-50 even:bg-white">
                  <td className="px-3 py-2 font-semibold">{course.name}</td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    {course.isIndividual
                      ? "Individuální"
                      : course.isPair
                        ? "Párový"
                        : "Skupinový"}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {course.teacher?.firstName} {course.teacher?.lastName}
                    </div>
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    {course.group?.name}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Link href={`/seznam-kurzu/${course.id}`}>
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
                            onClick={() => openModalUpdate(course)}
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
                              handleDelete(course.id);
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
      <CreateUpdateCourseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type="create"
        lectors={lectors}
      />
      <CreateUpdateCourseModal
        isOpen={isOpenUpdate}
        onClose={() => setIsOpen(false)}
        lectors={lectors}
        data={selectedCourse}
        type="update"
      />
    </>
  );
}
