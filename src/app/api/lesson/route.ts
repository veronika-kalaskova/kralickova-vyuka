import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, startDate, endDate, repeat } = body;

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    const course = await db.course.findFirst({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: "Kurz nenalezen" }, { status: 404 });
    }

    const lessons = [];
    const duration = Math.round((parsedEnd.getTime() - parsedStart.getTime()) / 60000);

    if (repeat === "weekly") {
      const courseEnd = new Date(course.endDate);
      let currentDate = new Date(parsedStart);

      const startHours = parsedStart.getHours();
      const startMinutes = parsedStart.getMinutes();
      const endHours = parsedEnd.getHours();
      const endMinutes = parsedEnd.getMinutes();

      while (currentDate <= courseEnd) {
        const start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          startHours,
          startMinutes
        );
        const end = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          endHours,
          endMinutes
        );

        lessons.push({
          courseId,
          startDate: start,
          endDate: end,
          repeat: "weekly",
          duration: duration,
        });

        currentDate.setDate(currentDate.getDate() + 7);
      }

      await db.lesson.createMany({ data: lessons });
    } else {
      const lesson = await db.lesson.create({
        data: {
          courseId,
          startDate: parsedStart,
          endDate: parsedEnd,
          repeat: "none",
          duration: duration,
        },
      });

      lessons.push(lesson);
    }

    return NextResponse.json(
      { message: "Lekce vytvořena", lessons },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Chyba při vytváření lekce" },
      { status: 500 }
    );
  }
}
