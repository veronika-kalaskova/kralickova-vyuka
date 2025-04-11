import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
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

  console.log(loggedUser?.CoursesTaught);

  return (
    <div className="p-4">
      <h1 className="title">Můj profil</h1>
      <div className="flex flex-col gap-2">
        <div>
          <strong>Jméno:</strong> {loggedUser?.firstName} {loggedUser?.lastName}
        </div>
        <div>
          <strong>Email:</strong> {loggedUser?.email}
        </div>
        <div>
          <strong>Role:</strong>{" "}
          {loggedUser?.UserRole.map((role) => role.role.name).join(", ")}
        </div>
        <div>
          <strong>Učím kurzy:</strong>{" "}
          {loggedUser?.CoursesTaught.map((course) => course.name).join(", ")}
        </div>
        <div>
          <strong>Studuji kurzy:</strong>{" "}
          {[
            ...(loggedUser?.CoursesTaken.map((course) => course.name) ?? []),

            ...(loggedUser?.StudentGroup.flatMap(
              (group) => group.group?.Course.map((c) => c.name) ?? [],
            ) ?? []),
          ].join(", ")}
        </div>

        <div>
          <strong>Učím skupiny:</strong>{" "}
          {loggedUser?.CoursesTaught.filter((course) => course.group)
            .map((course) => course.group?.name)
            .join(", ")}
        </div>
        <div>
          <strong>Studuji skupiny:</strong>{" "}
          {[
            ...(loggedUser?.CoursesTaken.filter((course) => course.group).map(
              (course) => course.group?.name,
            ) ?? []),

            ...(loggedUser?.StudentGroup.map((group) => group.group?.name) ??
              []),
          ].join(", ")}
        </div>
      </div>
    </div>
  );
}
