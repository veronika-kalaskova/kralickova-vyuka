import CalendarComponent from "@/components/Calendar";
import Materials from "@/components/Materials";
import { prisma } from "@/lib/db";
import Link from "next/link";
import React from "react";

export default async function Lekce({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = await prisma.lesson.findFirst({
    where: { id: parseInt(id) },
    include: {
      course: {
        include: {
          teacher: true,
          group: true,
        },
      },
    },
  });

  const students = lesson?.course.isIndividual
    ? await prisma.user.findMany({
        where: {
          deletedAt: null,
          CoursesTaken: {
            some: {
              id: lesson.courseId,
            },
          },
        },
        include: {
          CoursesTaken: true,
        },
      })
    : await prisma.user.findMany({
        where: {
          deletedAt: null,
          StudentGroup: {
            some: {
              groupId: lesson?.course.groupId ?? undefined,
            },
          },
        },
        include: {
          StudentGroup: true,
        },
      });

  const materials = await prisma.studyMaterial.findMany({
    where: {
      lessonId: parseInt(id),
    },
  });

  function formatTime(start: Date, end: Date): string {
    const formatStart = `${start.getDate()}. ${start.getMonth() + 1}. ${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
    const formatEnd = `${end.getDate()}. ${end.getMonth() + 1}. ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;

    return `${formatStart} - ${formatEnd}`;
  }

  if (!lesson) {
    return (
      <div className="p-4">
        <h1 className="title">Lekce nenalezena</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 lg:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-1/2">
        <h1 className="title mb-6">
          Lekce {formatTime(lesson.startDate, lesson.endDate)}
        </h1>

        <div className="mb-6 flex flex-col gap-1">
          <div className="grid grid-cols-1 gap-1 text-sm text-gray-800 sm:grid-cols-2">
            <div className="flex items-center gap-1">
              <span className="font-semibold">Lektor:</span>
              <span>
                {lesson.course.teacher?.firstName}{" "}
                {lesson.course.teacher?.lastName}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-semibold">Kurz:</span>
              <span>{lesson.course?.name || "Nezařazeno"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Typ kurzu:</span>
              <span>
                {lesson.course.isIndividual
                  ? "Individuální"
                  : lesson.course.isPair
                    ? "Párový"
                    : "Skupinový"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Učebnice:</span>
              <span>{lesson.course.textbook ? lesson.course.textbook : "Učebnice není nastavena"} </span>
            </div>
          </div>
        </div>

        <Materials lessonId={lesson.id} data={materials} />
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2">
        <div className="mb-5 bg-white">
          <h2 className="title mb-6">Seznam studentů</h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {students.map((student) => (
              <Link
                href={`/seznam-studentu/${student.id}`}
                key={student.id}
                className="cursor-pointer rounded-lg border-1 border-gray-100 bg-gray-50 p-4 transition-all hover:border-[#ff8904]"
              >
                <div className="flex items-center justify-between gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">
                      {student.firstName} {student.lastName}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {student.class ? student.class : "Třída není nastavena"} 
                    </span>
                  </div>
                  {student.pickup && (
                    <span className="rounded-md bg-[#ff8904] px-2 py-1 text-sm font-semibold text-white">
                      Vyzvedávání
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
