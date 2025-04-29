import { prisma } from "@/lib/db";
import { User } from "@prisma/client";
import React from "react";

export default async function Lektor({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const lector: User | null = await prisma.user.findFirst({
    where: { id: parseInt(id) },
  });

  if (!lector) {
    return (
      <div className="p-4">
        <h1 className="title">Lektor nenalezen</h1>
      </div>
    );
  }

  return <div className="p-4">{lector.firstName} {lector.lastName}</div>;
}
