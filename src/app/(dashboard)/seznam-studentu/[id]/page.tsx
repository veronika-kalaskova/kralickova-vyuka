import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  User,
  BookOpen,
  Users,
  School,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
} from "lucide-react";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CalendarComponent from "@/components/Calendar";
import TableStudentAttendance from "@/components/table/TableStudentAttendance";
import TableUpcomingLessons from "@/components/table/TableUpcomingLessons";

export default async function Student({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.user.findFirst({
    where: { id: parseInt(id) },
    include: {
      CoursesTaken: true,
      StudentGroup: {
        include: {
          group: {
            include: {
              Course: true,
            },
          },
        },
      },
    },
  });

  const studentId = parseInt(id);

  const lessons = await prisma.lesson.findMany({
    where: {
      deletedAt: null,
      OR: [
        {
          course: {
            studentId: studentId,
          },
        },
        {
          course: {
            group: {
              StudentGroup: {
                some: {
                  studentId: studentId,
                },
              },
            },
          },
        },
      ],
    },
    include: {
      course: {
        include: {
          teacher: true,
          group: true,
          student: true,
        },
      },
      teacher: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const upcomingLessons = await prisma.lesson.findMany({
    where: {
      startDate: {
        gte: new Date(),
      },
      deletedAt: null,
      OR: [
        {
          course: {
            studentId: studentId,
          },
        },
        {
          course: {
            group: {
              StudentGroup: {
                some: {
                  studentId: studentId,
                },
              },
            },
          },
        },
      ],
    },
    include: {
      course: {
        include: {
          teacher: true,
          group: true,
          student: true,
        },
      },
      teacher: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { studentId: studentId },
        {
          group: {
            StudentGroup: {
              some: {
                studentId: studentId,
              },
            },
          },
        },
      ],
      deletedAt: null
    },
    include: {
      teacher: true,
      Lesson: {
        include: {
          Attendance: {
            where: {
              userId: studentId,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          startDate: "asc",
        },
      },
    },
  });

  const replacements = await prisma.replacement.findMany({
    where: {
      studentId: studentId,
    },
  });

  const session = await getServerSession(authOptions);

  if (!student) {
    return (
      <div className="p-4">
        <h1 className="title">Lektor nenalezen</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="title mb-0">
            Student - {student.firstName} {student.lastName}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* LEFT */}
        <div className="w-full lg:w-1/2">
          {/* INFO O LEKCI */}
          <div className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-800 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Email:</span>
                <span>{student.email || "Neuveden"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Telefon:</span>
                <span>{student.phone || "Neuveden"}</span>
              </div>

              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Třída:</span>
                <span>{student.class || "Neuveden"}</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Vyzvedávání:</span>
                <span>{student.pickup ? "Ano" : "Ne"}</span>
              </div>
            </div>
          </div>
          <CalendarComponent
            lessons={lessons}
            defaultView={"work_week"}
            availableViews={["work_week"]}
            classNameProp="h-[700px]  w-full mb-6 rounded-md border border-gray-200 p-4 shadow-sm"
            roles={session?.user.roles}
          />
          <TableUpcomingLessons lessons={upcomingLessons} />
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2">
          <div className="mb-5 bg-white">
            <h2 className="title mb-6">Vyučované kurzy</h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {student.CoursesTaken?.map((course, index) => (
                <Link
                  href={`/seznam-kurzu/${course.id}`}
                  key={index}
                  className="cursor-pointer rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-[#ff8904]"
                >
                  <div className="flex items-center justify-between gap-8">
                    <h3 className="text-sm font-medium text-gray-800">
                      {course.name}
                    </h3>
                    <span className="rounded-md bg-[#ff8904] px-2 py-1 text-sm font-semibold text-white">
                      {course.isIndividual
                        ? "individuální"
                        : course.isPair
                          ? "párový"
                          : "skupinový"}
                    </span>
                  </div>
                </Link>
              ))}
              {student.StudentGroup?.flatMap((studentGroup) =>
                studentGroup.group.Course.map((course, index) => (
                  <Link
                    href={`/seznam-kurzu/${course.id}`}
                    key={index}
                    className="cursor-pointer rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-[#ff8904]"
                  >
                    <div className="flex items-center justify-between gap-8">
                      <h3 className="text-sm font-medium text-gray-800">
                        {course.name}
                      </h3>
                      <span className="rounded-md bg-[#ff8904] px-2 py-1 text-sm font-semibold text-white">
                        {course.isIndividual
                          ? "individuální"
                          : course.isPair
                            ? "párový"
                            : "skupinový"}
                      </span>
                    </div>
                  </Link>
                )),
              )}
            </div>
          </div>
          <TableStudentAttendance
            courses={courses}
            replacements={replacements}
          />
        </div>
      </div>
    </div>
  );
}
