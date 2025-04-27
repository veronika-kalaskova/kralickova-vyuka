"use client";
import React, { useState } from "react";
import CreateUpdateAttendanceModal from "./forms/CreateUpdateAttendance";
import { Attendance, Course, Group, Lesson, User } from "@prisma/client";

interface Props {
  lesson: Lesson & {
    course: Course & {
      teacher: User | null;
    };
  };
  students: User[];
  roles: string[] | undefined;
  isAttendanceDone: boolean;
  attendance: Attendance[];
}

export default function LessonDetailButtons({
  lesson,
  students,
  roles,
  isAttendanceDone,
  attendance,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  return (
    <>
      <div className="flex justify-end gap-2">
        {roles?.includes("admin") && (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100"
          >
            Upravit lekci
          </button>
        )}

        {(roles?.includes("admin") || roles?.includes("lektor")) && (
          <button
            type="button"
            onClick={openModal}
            className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
          >
            {isAttendanceDone ? "Upravit docházku" : "Zadat docházku"}
          </button>
        )}

        {roles?.includes("admin") && (
          <button className="cursor-pointer rounded-lg bg-red-400 px-4 py-3 font-medium text-white transition-all hover:bg-red-500">
            Nahradit lekci
          </button>
        )}
      </div>

      {!isAttendanceDone && (
        <CreateUpdateAttendanceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          typeForm="create"
          lesson={lesson}
          students={students}
        />
      )}

      {isAttendanceDone && (
        <CreateUpdateAttendanceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          typeForm="update"
          lesson={lesson}
          students={students}
          attendanceData={attendance}
        />
      )}
    </>
  );
}
