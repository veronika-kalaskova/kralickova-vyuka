import Link from "next/link";
import Image from "next/image";
import { Course, Lesson, User } from "@prisma/client";
import React from "react";
import { LessonWithCourseAndTeacher } from "@/types/LessonType";

interface Props {
  lessons: LessonWithCourseAndTeacher[];
}

export default function TableUpcomingLessons({ lessons }: Props) {
  return (
    <div className="mb-8 rounded-md border border-gray-200 p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold">Nadcházející lekce</h2>

      {lessons.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="py-2.5 text-center font-medium"></th>
              <th className="py-2.5 font-medium">Datum a čas</th>
              <th className="py-2.5 font-medium">Kurz</th>
              <th className="py-2.5 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lessons.map((lesson, index) => (
              <tr key={lesson.id} className="hover:bg-gray-50">
                <td className="py-2.5">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                      {index + 1}.
                    </div>
                  </div>
                </td>
                <td className="py-2.5 text-sm text-gray-800">
                  {lesson.startDate.toLocaleString("cs-CZ", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Europe/Prague",
                  })}
                </td>
                <td className="py-2.5 text-sm text-gray-800">
                  <span className="inline-block rounded-full bg-[#FFE3C5] px-3 py-1 text-xs font-semibold">
                    {lesson.course.name}
                  </span>
                </td>
                <td className="py-2.5">
                  <Link href={`/lekce/${lesson.id}`}>
                    <button className="transform cursor-pointer rounded-full px-2 py-2 transition-all duration-300 hover:bg-orange-200">
                      <Image
                        src="/arrow-right.svg"
                        alt="detail"
                        width={20}
                        height={20}
                      />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-5 py-10 text-center text-gray-500">
          Žádné nadcházející lekce.
        </div>
      )}
    </div>
  );
}
