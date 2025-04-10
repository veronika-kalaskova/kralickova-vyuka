import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      teacherId,
      startDate,
      endDate,
      description,
      textbook,
      isIndividual,
      isPair,
    } = body;

    const existingCourse = await db.course.findFirst({
      where: {
        name: name,
        deletedAt: null,
      },
    });

    if (existingCourse) {
      return NextResponse.json({ message: "Course exists" }, { status: 409 });
    }

    const newCourse = await db.course.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        textbook,
        isIndividual,
        isPair,
        teacher: {
          connect: {
            id: parseInt(teacherId),
          },
        },
      },
    });

    return NextResponse.json(
      { course: newCourse, message: "kurz vytvořen" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "chyba při vytváření kurzu" },
      { status: 500 },
    );
  }
}
