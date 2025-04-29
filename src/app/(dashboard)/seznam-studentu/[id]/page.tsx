import { prisma } from "@/lib/db";
import { User } from "@prisma/client";
import React from "react";

export default async function Student({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const student: User | null = await prisma.user.findFirst({
    where: { id: parseInt(id) },
  });

  if (!student) {
    return (
      <div className="p-4">
        <h1 className="title">Student nenalezen</h1>
      </div>
    );
  }

  return <div className="p-4">{student.firstName} {student.lastName}</div>;
}
