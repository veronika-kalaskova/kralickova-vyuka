import TableCourse from "@/components/table/TableCourse";
import TableLector from "@/components/table/TableLector";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import React from "react";

export default async function SeznamLektoru() {
  const allLectors = await prisma.user.findMany({
    where: {
      deletedAt: null,
      UserRole: {
        some: {
          roleId: 2,
        },
      },
    }
  });

  const allCourses = await prisma.course.findMany({
    where: {
      deletedAt: null
    },
    include: {
      teacher: true, 
      group: true,
    },
  });

  const holidays = await prisma.holiday.findMany({
    where: {
      deletedAt: null,
    },
  });

  const session = await getServerSession(authOptions);

  return (
    <TableCourse
      data={allCourses}
      lectors={allLectors}
      roles={session?.user.roles}
      manualHolidays={holidays}
    />
  );
}
