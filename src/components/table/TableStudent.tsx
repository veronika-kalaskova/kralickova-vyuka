"use client";
import { Group, User, Course, StudentGroup } from "@prisma/client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import CreateLectorModal from "../auth/CreateLectorModal";
import Link from "next/link";
import SearchInput from "../SearchInput";
import CreateStudentModal from "../auth/CreateStudentModal";
import { UserWithCoursesAndGroups } from "@/types/UserType";

interface Props {
  data: UserWithCoursesAndGroups[];
  coursesWithoutStudent: (Course & { group: Group | null })[];
  roles?: string[];
}

export default function TableStudent({
  data,
  coursesWithoutStudent,
  roles,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const isAdmin = roles?.includes("admin");

  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);

  const openModalUpdate = (student: User) => {
    setSelectedStudent(student);
    setIsOpenUpdate(true);
  };

  const sortedData = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(
      query
        .normalize("NFD") // prevadi znaky s diakritikou
        .replace(/[\u0300-\u036f]/g, "") // odstrani diakritiku
        .toLowerCase(),
    );
  };

  const filteredData = sortedData.filter((student) =>
    `${student.firstName} ${student.lastName}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(searchQuery),
  );

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Opravdu chcete smazat tohoto studenta?");
    if (!confirmed) return;

    const response = await fetch("/api/student/delete", {
      method: "PUT",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Chyba při mazání studenta.");
    }
  };

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="title mb-0">Přehled studentů</h1>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
            >
              Přidat studenta
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
              {filteredData.map((student) => (
                <tr key={student.id} className="odd:bg-gray-50 even:bg-white">
                  <td className="px-3 py-2 font-semibold">
                    {student.firstName} {student.lastName}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    {student.email}
                  </td>

                  <td className="hidden px-3 py-2 md:table-cell">
                    <div className="flex max-w-[400px] flex-wrap gap-1">
                      {student.CoursesTaken?.map(
                        (course: Course, index: number) => (
                          <span
                            key={index}
                            className="inline-block rounded-full bg-[#FFE3C5] px-3 py-1 text-xs font-semibold"
                          >
                            {course.name}
                          </span>
                        ),
                      )}
                      {student.StudentGroup?.flatMap((studentGroup) =>
                        studentGroup.group.Course.map((course, index) => (
                          <span
                            key={course.id}
                            className="inline-block rounded-full bg-[#FFE3C5] px-3 py-1 text-xs font-semibold"
                          >
                            {course.name}
                          </span>
                        )),
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Link href={`/seznam-studentu/${student.id}`}>
                        <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200">
                          <Image
                            src="/arrow-right.svg"
                            alt="profile"
                            width={20}
                            height={20}
                          />
                        </button>
                      </Link>
                      {/* <Link href={`/seznam-studentu/${student.id}`}>
                        <button className="hidden transform cursor-pointer rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold transition-all duration-300 hover:bg-[#FFE3C5] md:block">
                          Přejít na profil
                        </button>
                      </Link> */}
                      {isAdmin && (
                        <>
                          <button
                            className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200"
                            onClick={() => openModalUpdate(student)}
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
                              handleDelete(student.id);
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
      <CreateStudentModal
        roleId={3}
        isOpen={isOpen}
        courses={coursesWithoutStudent}
        onClose={() => setIsOpen(false)}
        type="create"
      />
      <CreateStudentModal
        roleId={3}
        isOpen={isOpenUpdate}
        courses={coursesWithoutStudent}
        onClose={() => {
          setIsOpenUpdate(false);
        }}
        data={selectedStudent}
        type="update"
      />
    </>
  );
}
