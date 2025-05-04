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

    if (!newCourse.isIndividual) { 
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
              id: newCourse.id,
            },
          },
        },
      });


    }

    await db.user.update({
      where: { id: parseInt(teacherId) },
      data: {
        CoursesTaught: {
          connect: { id: newCourse.id },
        },
      },
    });

    return NextResponse.json(
      { course: newCourse, message: "kurz vytvořen" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "chyba při vytváření kurzu" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, textbook, teacherId, startDate, endDate } =
      body;

    const existingCourse = await db.course.findFirst({
      where: {
        name,
        deletedAt: null,
        id: {
          not: id,
        },
      },
    });

    if (existingCourse) {
      return NextResponse.json({ message: "Course exists" }, { status: 409 });
    }

    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        name,
        description,
        textbook,
        teacherId: parseInt(teacherId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    await db.lesson.updateMany({
      where: {
        courseId: id,
      },
      data: {
        teacherId: parseInt(teacherId),
      },
    });

    return NextResponse.json(
      { course: updatedCourse, message: "kurz upraven a lekce aktualizovány" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
