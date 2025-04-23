import CalendarComponent from "@/components/Calendar";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function MujProfil() {
  const session = await getServerSession(authOptions);

  const loggedUser = await prisma.user.findFirst({
    where: {
      username: session?.user.username,
    },
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      CoursesTaught: {
        where: {
          deletedAt: null,
        },
        include: {
          group: true,
        },
      },
      CoursesTaken: {
        where: {
          deletedAt: null,
        },
        include: {
          group: true,
        },
      },
      StudentGroup: {
        where: {
          deletedAt: null,
        },
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

  const lessons = await prisma.lesson.findMany({
    where: {
      course: {
        teacherId: loggedUser?.id,
      },
      deletedAt: null,
    },
    include: {
      course: {
        include: {
          teacher: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4">
      {/* LEFT */}
      <div className="w-full lg:w-1/2">
        <h1 className="title mb-2">Můj profil</h1>

        <div className="flex flex-col gap-2">
          <div className="mt-2 mb-6 flex flex-col gap-4 text-sm text-gray-700 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-2">
              <Image src={"/mail.svg"} alt="mail" height={28} width={28} />
              <span className="text-sm">{loggedUser?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src={"/phone.svg"} alt="mail" height={28} width={28} />
              <span className="text-sm">
                {loggedUser?.phone ? loggedUser.phone : "Telefon není nastaven"}
              </span>
            </div>
          </div>

          <CalendarComponent
            lessons={lessons}
            defaultView={"agenda"}
            availableViews={["agenda"]}
            classNameProp="h-[500px] w-full"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2">
 
        <div className="bg-white mb-5">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Vyučované kurzy
          </h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {loggedUser?.CoursesTaught.map((course, index) => (
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
      <div>
        kalkulacka
      </div>
      </div>

    </div>
  );
}
