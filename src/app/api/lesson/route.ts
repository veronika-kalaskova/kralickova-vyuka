import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, startDate, endDate, repeat } = body;

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    
    // Store the original hours and minutes
    const startHours = parsedStart.getHours();
    const startMinutes = parsedStart.getMinutes();
    const endHours = parsedEnd.getHours();
    const endMinutes = parsedEnd.getMinutes();

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

      while (currentDate <= courseEnd) {

        const start = new Date(currentDate);
        start.setHours(startHours, startMinutes, 0, 0);
        
        const end = new Date(currentDate);
        end.setHours(endHours, endMinutes, 0, 0);

        lessons.push({
          courseId,
          startDate: start,
          endDate: end,
          repeat: "weekly",
          duration: duration,
        });

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }

      await db.lesson.createMany({ data: lessons });
    } else {
      // For non-repeating lessons, ensure consistent time
      parsedStart.setHours(startHours, startMinutes, 0, 0);
      parsedEnd.setHours(endHours, endMinutes, 0, 0);
      
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