"use client";
import React, { useState } from "react";
import CreateUpdateAttendanceModal from "./forms/CreateUpdateAttendance";
import { Attendance, Course, Group, Lesson, User } from "@prisma/client";
import CreateUpdateLessonModal from "./forms/CreateUpdateLessonModal";
import CreateLessonReplacement from "./forms/CreateLessonReplacementModal";
import { LessonWithCourseAndTeacher } from "@/types/LessonType";

interface Props {
  lesson: LessonWithCourseAndTeacher;
  students: User[];
  lectors: User[];
  roles?: string[];
  isAttendanceDone: boolean;
  attendance: Attendance[];
}

export default function LessonDetailButtons({
  lesson,
  students,
  roles,
  isAttendanceDone,
  attendance,
  lectors,
}: Props) {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);

  const openAttendanceModal = () => setIsAttendanceModalOpen(true);
  const closeAttendanceModal = () => setIsAttendanceModalOpen(false);

  const openLessonModal = () => setIsLessonModalOpen(true);
  const closeLessonModal = () => setIsLessonModalOpen(false);

  const openLessonReplacementModal = () => setIsReplacementModalOpen(true);
  const closeLessonReplacementModal = () => setIsReplacementModalOpen(false);

  return (
    <>
      <div className="flex justify-start gap-2 md:justify-end">
        {roles?.includes("admin") && (
          <button
            type="button"
            onClick={openLessonModal}
            className="cursor-pointer rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100"
          >
            Upravit lekci
          </button>
        )}

        {(roles?.includes("admin") || roles?.includes("lektor")) && (
          <button
            type="button"
            onClick={openAttendanceModal}
            className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
          >
            {isAttendanceDone ? "Upravit docházku" : "Zadat docházku"}
          </button>
        )}

        {roles?.includes("admin") &&
          lesson.course.isIndividual &&
          !lesson.deletedAt && (
            <button
              onClick={openLessonReplacementModal}
              className="cursor-pointer rounded-lg bg-red-400 px-4 py-3 font-medium text-white transition-all hover:bg-red-500"
            >
              Nahradit lekci
            </button>
          )}
      </div>

      {!isAttendanceDone && (
        <CreateUpdateAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={closeAttendanceModal}
          typeForm="create"
          lesson={lesson}
          students={students}
        />
      )}

      {isAttendanceDone && (
        <CreateUpdateAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={closeAttendanceModal}
          typeForm="update"
          lesson={lesson}
          students={students}
          attendanceData={attendance}
        />
      )}

      <CreateUpdateLessonModal
        isOpen={isLessonModalOpen}
        onClose={closeLessonModal}
        data={lesson}
        type="update"
        course={lesson.course}
        lectors={lectors}
      />

      {!lesson.deletedAt && (
        <CreateLessonReplacement
          isOpen={isReplacementModalOpen}
          onClose={closeLessonReplacementModal}
          lesson={lesson}
          lectors={lectors}
        />
      )}
    </>
  );
}
