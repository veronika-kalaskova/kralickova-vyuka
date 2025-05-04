import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function getDurationInMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

function buildDateTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, startDate, endDate, repeat, teacherId } = body;

    const startRaw = new Date(startDate);
    const endRaw = new Date(endDate);

    const startHours = startRaw.getHours();
    const startMinutes = startRaw.getMinutes();
    const endHours = endRaw.getHours();
    const endMinutes = endRaw.getMinutes();

    const course = await db.course.findFirst({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ message: "Kurz nenalezen" }, { status: 404 });
    }

    const lessons = [];
    const duration = getDurationInMinutes(startRaw, endRaw);

    if (repeat === "weekly") {
      const courseEnd = new Date(course.endDate);
      let currentDate = new Date(startRaw);

      while (currentDate <= courseEnd) {
        const start = buildDateTime(currentDate, startHours, startMinutes);
        const end = buildDateTime(currentDate, endHours, endMinutes);

        lessons.push({
          courseId,
          startDate: start,
          endDate: end,
          teacherId: parseInt(teacherId),
          repeat: "weekly",
          duration,
        });

        currentDate.setDate(currentDate.getDate() + 7);
      }

      await db.lesson.createMany({ data: lessons });
    } else {
      const start = buildDateTime(startRaw, startHours, startMinutes);
      const end = buildDateTime(startRaw, endHours, endMinutes);

      const lesson = await db.lesson.create({
        data: {
          courseId,
          startDate: start,
          endDate: end,
          teacherId: parseInt(teacherId),
          repeat: "none",
          duration,
        },
      });

      lessons.push(lesson);
    }

    return NextResponse.json(
      { message: "Lekce vytvořena", lessons },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Chyba při vytváření lekce" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, startDate, endDate, teacherId } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID lekce je povinné" },
        { status: 400 },
      );
    }

    const lesson = await db.lesson.findUnique({ where: { id } });
    if (!lesson) {
      return NextResponse.json(
        { message: "Lekce nenalezena" },
        { status: 404 },
      );
    }


    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = getDurationInMinutes(start, end);

    const updatedLesson = await db.lesson.update({
      where: { id },
      data: {
        startDate: start,
        endDate: end,
        teacherId: parseInt(teacherId),
        duration,
      },
    });

    return NextResponse.json(
      { message: "Lekce byla upravena", lesson: updatedLesson },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Chyba při úpravě lekce" },
      { status: 500 },
    );
  }
}
