import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, courseId, teacherId } = body;

    const existingGroup = await db.group.findFirst({
      where: {
        name: name,
        deletedAt: null,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        {
          message: "Group exists",
        },
        { status: 409 },
      );
    }

    const newGroup = await db.group.create({
      data: {
        name,
        teacherId: parseInt(teacherId),
        Course: {
          connect: {
            id: parseInt(courseId),
          },
        },
      },
    });

    await db.user.update({
      where: { id: parseInt(teacherId) },
      data: {
        CoursesTaught: {
          connect: { id: parseInt(courseId) },
        },
      },
    });

    return NextResponse.json(
      { group: newGroup, message: "skupina vytvorena" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
