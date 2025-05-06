import Link from "next/link";
import { prisma } from "@/lib/db";
import { User, BookOpen, Users, School, Mail, Phone } from "lucide-react";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TableUpcomingLessons from "@/components/table/TableUpcomingLessons";
import Calculator from "@/components/Calculator";
import CalendarComponent from "@/components/Calendar";

export default async function Lektor({params}: {params: Promise<{ id: string }>}) {

  const { id } = await params;

  const lector = await prisma.user.findFirst({
    where: { id: parseInt(id) },
  });

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: parseInt(id),
      deletedAt: null,
    },
    include: {
      course: {
        include: {
          teacher: true,
          student: true
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
      teacherId: parseInt(id),
      startDate: {
        gte: new Date(),
      },
    },
    include: {
      teacher: true,
      course: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const courses = await prisma.course.findMany({
    where: {
      teacherId: parseInt(id),
    },
    include: {
      student: true,
      group: true,
    },
  });

  const session = await getServerSession(authOptions);

  if (!lector) {
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
            Lektor - {lector.firstName} {lector.lastName}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* LEFT */}
        <div className="w-full lg:w-1/2">
          {/* INFO O LEKCI */}
          <div className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-800">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Email:</span>
                <span>{lector.email || "Neuveden"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Telefon:</span>
                <span>{lector.phone || "Neuveden"}</span>
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
              {courses.map((course, index) => (
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
            </div>
          </div>
          <Calculator data={lessons} />
        </div>
      </div>
    </div>
  );
}
