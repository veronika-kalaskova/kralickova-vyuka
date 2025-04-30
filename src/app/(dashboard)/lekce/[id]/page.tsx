import Comments from "@/components/Comments";
import LessonDetailButtons from "@/components/LessonDetailButtons";
import Materials from "@/components/Materials";
import AttendanceTable from "@/components/table/TableAttendance";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";
import { User, BookOpen, Users, School } from "lucide-react";

export default async function Lekce({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;

  const lesson = await prisma.lesson.findFirst({
    where: { id: parseInt(id) },
    include: {
      course: {
        include: {
          teacher: true,
        },
      },
      teacher: true,
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

  const lectors = await prisma.user.findMany({
    where: {
      deletedAt: null,
      UserRole: {
        some: {
          roleId: 2,
        },
      },
    },
    include: {
      UserRole: true,
    },
  });

  const materials = await prisma.studyMaterial.findMany({
    where: {
      lessonId: parseInt(id),
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      lessonId: parseInt(id),
    },
    include: {
      user: true,
    },
  });

  const attendance = await prisma.attendance.findMany({
    where: {
      lessonId: parseInt(id),
    },
    include: {
      user: true,
      lesson: {
        include: {
          course: true,
        },
      },
    },
  });

  const session = await getServerSession(authOptions);

  const loggedUser = await prisma.user.findFirst({
    where: {
      username: session?.user.username,
    },
    include: {
      UserRole: true,
    },
  });

  function formatTime(start: Date, end: Date): string {
    const formatStart = start.toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Prague",
    });

    const formatEnd = end.toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Prague",
    });

    return `${formatStart} - ${formatEnd}`;
  }

  if (!lesson) {
    return (
      <div className="p-4">
        <h1 className="title">Lekce nenalezena</h1>
      </div>
    );
  }

  const roles = session?.user.roles;

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="title mb-0">
            Lekce {formatTime(lesson.startDate, lesson.endDate)}
          </h1>

          {lesson.course.description && (
            <p className="mt-3 text-sm text-gray-500">
              {lesson.course.description}
            </p>
          )}
        </div>

        <LessonDetailButtons
          lesson={lesson}
          students={students}
          roles={roles}
          isAttendanceDone={attendance.length > 0}
          attendance={attendance}
          lectors={lectors}
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* LEFT */}
        <div className="w-full lg:w-1/2">
          {/* INFO O LEKCI */}
          <div className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-800 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Lektor:</span>
                <span>
                  {lesson.teacher.firstName}{" "}
                  {lesson.teacher.lastName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Kurz:</span>
                <span>{lesson.course?.name || "Nezařazeno"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Typ kurzu:</span>
                <span>
                  {lesson.course.isIndividual
                    ? "Individuální"
                    : lesson.course.isPair
                      ? "Párový"
                      : "Skupinový"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Učebnice:</span>
                <span>
                  {lesson.course.textbook
                    ? lesson.course.textbook
                    : "Není nastavena"}
                </span>
              </div>
            </div>
          </div>

          <Materials lessonId={lesson.id} data={materials} />

          <AttendanceTable data={attendance} />
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2">
          <div className="mb-5 bg-white">
            <h2 className="title mb-6">Seznam studentů</h2>
            <div className="grid grid-cols-1 gap-4">
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

          {loggedUser && (
            <Comments data={comments} lessonId={lesson.id} user={loggedUser} />
          )}
        </div>
      </div>
    </div>
  );
}
