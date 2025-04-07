import Table from "@/components/table/TableLector";
import { prisma } from "@/lib/db";
import React from "react";

export default async function SeznamLektoru() {
  const allLectors = await prisma.user.findMany({
    where: {
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
        teacherId: null
      },
      include: {
        group: true
      }
    });

  return <Table data={allLectors} coursesWithoutLector={coursesWithoutLector} />;
}
