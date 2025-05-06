"use client";

import React from "react";
import { Course, Lesson, Attendance, Replacement } from "@prisma/client";
import { CourseWithLessonsAttendances } from "@/types/CourseType";

interface Props {
  courses: CourseWithLessonsAttendances[];
  replacements: Replacement[];
}

export default function TableStudentAttendance({
  courses,
  replacements,
}: Props) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Prague",
    });
  };

  const getAttendanceStatus = (attendances: Attendance[]) => {
    if (attendances.length === 0) {
      return <span className="text-gray-500">Nezaznamenáno</span>;
    }

    const latestAttendance = attendances[0];

    switch (latestAttendance.type) {
      case "present":
        return (
          <span className="inline-flex items-center rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
            Přítomen
          </span>
        );
      case "absent":
        return (
          <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            Nepřítomen
          </span>
        );
      case "replacement":
        return (
          <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            Nahrazeno
          </span>
        );
      default:
        return <span className="text-gray-500">Nezaznamenáno</span>;
    }
  };

  const getReplacementNote = (lessonId: number) => {
    if (!replacements) return null;
    const replacement = replacements.find(
      (r) => r.originalLessonId === lessonId,
    );
    return replacement?.note ?? null;
  };

  return (
    <div className="space-y-8">
      <h2 className="title mb-6">Docházka</h2>

      {courses.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-gray-500 shadow-sm">
          Žádné kurzy k zobrazení.
        </div>
      ) : (
        courses.map((course) => (
          <div
            key={course.id}
            className="rounded-md border border-gray-200 p-4 shadow-sm"
          >
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Pro kurz: {course.name}
            </h3>

            {course.Lesson && course.Lesson.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="py-2.5 text-center font-medium"></th>
                    <th className="py-2.5 font-medium">Datum a čas</th>
                    <th className="py-2.5 font-medium">Docházka</th>
                    {replacements.length > 0 && (
                      <th className="py-2.5 font-medium">Poznámka</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {course.Lesson.map((lesson, index) => (
                    <tr key={lesson.id} className="hover:bg-gray-50">
                      <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center">
                          <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                            {index + 1}.
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-sm text-gray-800">
                        {formatDate(lesson.startDate)}
                      </td>
                      <td className="py-2.5">
                        {getAttendanceStatus(lesson.Attendance)}
                      </td>
                      <td className="py-2.5 text-sm text-gray-800">
                        {getReplacementNote(lesson.id) ? (
                          <span className="italic">
                            {getReplacementNote(lesson.id)}
                          </span>
                        ) : (
                          <span></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500">Žádné lekce k tomuto kurzu.</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
