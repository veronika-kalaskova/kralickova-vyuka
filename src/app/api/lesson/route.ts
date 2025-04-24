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

    // Výpočet trvání lekce v minutách
    const duration = Math.round((parsedEnd.getTime() - parsedStart.getTime()) / 60000); // milisekundy na minuty

    if (repeat === "weekly") {
      const courseEnd = new Date(course.endDate);
      let currentStart = new Date(parsedStart);
      let currentEnd = new Date(parsedEnd);

      while (currentStart <= courseEnd) {
        lessons.push({
          courseId,
          startDate: new Date(currentStart),
          endDate: new Date(currentEnd),
          repeat: "weekly",
          duration: duration,
        });

        currentStart.setDate(currentStart.getDate() + 7);
        currentEnd.setDate(currentEnd.getDate() + 7);
      }

      await db.lesson.createMany({
        data: lessons,
      });
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
