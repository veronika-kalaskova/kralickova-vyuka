import TableLector from "@/components/table/TableLector";
import TableStudent from "@/components/table/TableStudent";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import React from "react";

export default async function SeznamStudentu() {
  const allStudents = await prisma.user.findMany({
    where: {
      deletedAt: null,
      UserRole: {
        some: {
          roleId: 3,
        },
      },
    },
    include: {
      UserRole: {
        include: {
          role: true,
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

  const coursesWithoutStudent = await prisma.course.findMany({
    where: {
      studentId: null,
    },
    include: {
      group: true,
    },
  });

  const session = await getServerSession(authOptions);

  return (
    <TableStudent
      data={allStudents}
      coursesWithoutStudent={coursesWithoutStudent}
      roles={session?.user.roles}
    />
  );
}
