import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, roleId } = body;

    const updatedUser = await db.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
        CoursesTaken: {
          set: [],
        },
      },
    });

    await db.studentGroup.updateMany({
      where: {
        studentId: id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { user: updatedUser, message: "user deleted" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { message: "Chyba při mazání učitele" },
      { status: 500 },
    );
  }
}
