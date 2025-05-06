import CalendarComponent from "@/components/Calendar";
import LectorProfile from "@/components/profile/LectorProfile";
import StudentProfile from "@/components/profile/StudentProfile";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import React from "react";
import Lektor from "../seznam-lektoru/[id]/page";
import Student from "../seznam-studentu/[id]/page";

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
    },
  });

  if (!loggedUser) {
    return (
      <div className="p-4">
        <h1 className="title">Uživatel nenalezen</h1>
      </div>
    );
  }

  const roles = loggedUser.UserRole.map((ur) => ur.role.name.toLowerCase());

  const isStudent = roles.includes("student");

  const lektorParams = Promise.resolve({ id: loggedUser.id.toString() });

  const studentParams = Promise.resolve({ id: loggedUser.id.toString() });

  return (
    <>
      {isStudent ? (
        <Student params={studentParams} />
      ) : (
        <Lektor params={lektorParams} />
      )}
    </>
  );
}
