import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, startDate, endDate, repeat } = body;

    // Parse dates and explicitly extract time components
    const originalStart = new Date(startDate);
    const originalEnd = new Date(endDate);
    
    // Extract time components explicitly
    const startHours = originalStart.getHours();
    const startMinutes = originalStart.getMinutes();
    const endHours = originalEnd.getHours();
    const endMinutes = originalEnd.getMinutes();

    const course = await db.course.findFirst({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: "Kurz nenalezen" }, { status: 404 });
    }

    const lessons = [];
    const duration = Math.round((originalEnd.getTime() - originalStart.getTime()) / 60000);

    if (repeat === "weekly") {
      const courseEnd = new Date(course.endDate);
      // Start with the base date from the original start
      let currentDateBase = new Date(originalStart);
      
      while (currentDateBase <= courseEnd) {
        // Create completely new Date objects for each lesson to avoid reference issues
        const currentDateStr = currentDateBase.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Create start and end times with explicit hours/minutes to avoid DST issues
        const start = new Date(`${currentDateStr}T00:00:00`);
        start.setHours(startHours, startMinutes, 0, 0);
        
        const end = new Date(`${currentDateStr}T00:00:00`);
        end.setHours(endHours, endMinutes, 0, 0);

        lessons.push({
          courseId,
          startDate: start,
          endDate: end,
          repeat: "weekly",
          duration: duration,
        });

        // Add 7 days for next week
        currentDateBase.setDate(currentDateBase.getDate() + 7);
      }

      await db.lesson.createMany({ data: lessons });
    } else {
      // For non-repeating lessons
      const dateStr = originalStart.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const start = new Date(`${dateStr}T00:00:00`);
      start.setHours(startHours, startMinutes, 0, 0);
      
      const end = new Date(`${dateStr}T00:00:00`);
      end.setHours(endHours, endMinutes, 0, 0);
      
      const lesson = await db.lesson.create({
        data: {
          courseId,
          startDate: start,
          endDate: end,
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