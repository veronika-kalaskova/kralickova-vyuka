import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    // await db.lesson.updateMany({
    //   where: {
    //     courseId: id,
    //     deletedAt: null
    //   },
    //   data: {
    //     deletedAt: new Date(),
    //   },
    // });

    const course = await db.course.findUnique({
      where: { id: id },
      select: { groupId: true },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Kurz nebyl nalezen" },
        { status: 404 },
      );
    }

    if (course.groupId) {
      await db.group.update({
        where: { id: course.groupId },
        data: { deletedAt: new Date() },
      });

      await db.studentGroup.updateMany({
        where: { groupId: course.groupId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }

    await db.lesson.updateMany({
      where: {
        courseId: id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    const updatedCourse = await db.course.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { course: updatedCourse, message: "Kurz byl smazán" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chyba při mazání kurzu:", error);
    return NextResponse.json(
      { message: "Chyba při mazání kurzu" },
      { status: 500 },
    );
  }
}
