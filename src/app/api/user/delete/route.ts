import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, roleId, oldLectorId, newLectorId } = body;

    const deletedUser = await db.user.findFirst({
      where: {
        id: oldLectorId,
      },
      include: {
        CoursesTaught: true,
      },
    });

    await db.user.update({
      where: {
        id: newLectorId,
      },
      data: {
        CoursesTaught: {
          set: deletedUser?.CoursesTaught,
        },
      },
    });

    await db.user.update({
      where: { id: oldLectorId },
      data: {
        deletedAt: new Date(),
        CoursesTaught: {
          set: [], // smaze jeho kurzy
        },
      },
    });

    await db.group.updateMany({
      where: { teacherId: oldLectorId },
      data: { teacherId: newLectorId },
    });

    await db.lesson.updateMany({
      where: {
        teacherId: parseInt(oldLectorId),
      },
      data: {
        teacherId: parseInt(newLectorId),
      },
    });

    return NextResponse.json({ message: "user deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { message: "Chyba při mazání učitele" },
      { status: 500 },
    );
  }
}
