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
    },
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      CoursesTaught: {
        include: {
          group: true,
        },
      },
    },
  });

  const coursesWithoutLector = await prisma.course.findMany({
    where: {
      teacherId: null,
    },
    include: {
      group: true,
    },
  });

  const session = await getServerSession(authOptions);

  return (
    <TableLector
      data={allLectors}
      coursesWithoutLector={coursesWithoutLector}
      roles={session?.user.roles}
    />
  );
}
