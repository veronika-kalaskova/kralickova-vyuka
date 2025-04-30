import Link from "next/link";
import { prisma } from "@/lib/db";
import { User, BookOpen, Users, School } from "lucide-react";
import React from "react";
import TableLessons from "@/components/table/TableLessons";
import CourseDetail from "@/components/detail/CourseDetail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function Kurz({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id: parseInt(id) },
    include: {
      teacher: true,
      student: true,
      group: {
        include: {
          StudentGroup: {
            include: {
              student: true,
            },
          },
        },
      },
      Lesson: {
        include: {
          teacher: true,
        },
      },
    },
  });

  const session = await getServerSession(authOptions);

  if (!course) {
    return (
      <div className="p-4">
        <h1 className="title">Kurz nenalezen</h1>
      </div>
    );
  }

  const students =
    course.isIndividual && course.student
      ? [course.student]
      : course.group?.StudentGroup.map((studentInGroup) => studentInGroup.student) || [];

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="title mb-0">Kurz - {course.name}</h1>
          {course.description && (
          <p className="mt-3 text-sm text-gray-500">
            {course.description}
          </p>
          )}
        </div>

        <CourseDetail course={course} roles={session?.user.roles} />
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
                  {course.teacher?.firstName} {course.teacher?.lastName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Kurz:</span>
                <span>{course?.name || "Nezařazeno"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Typ kurzu:</span>
                <span>
                  {course.isIndividual
                    ? "Individuální"
                    : course.isPair
                      ? "Párový"
                      : "Skupinový"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Učebnice:</span>
                <span>
                  {course.textbook ? course.textbook : "Není nastavena"}
                </span>
              </div>
            </div>
          </div>

          <TableLessons course={course} />
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
        </div>
      </div>
    </div>
  );
}
