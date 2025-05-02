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
    const {
      courseId,
      date,
      startDate,
      endDate,
      teacherId,
      repeat,
      originalLessonId,
      note,
      studentId,
    } = body;

    const startRaw = new Date(startDate);
    const endRaw = new Date(endDate);

    const startHours = startRaw.getHours();
    const startMinutes = startRaw.getMinutes();
    const endHours = endRaw.getHours();
    const endMinutes = endRaw.getMinutes();

    const duration = getDurationInMinutes(startRaw, endRaw);

    const originalLesson = await db.lesson.findUnique({
      where: { id: originalLessonId },
      include: {
        course: {
          include: { student: true },
        },
      },
    });

    await db.lesson.update({
      where: { id: originalLessonId },
      data: {
        deletedAt: new Date(),
      },
    });

    if (
      !originalLesson ||
      !originalLesson.course ||
      !originalLesson.course.studentId
    ) {
      return NextResponse.json(
        { message: "Původní lekce nebo kurz nenalezen" },
        { status: 404 },
      );
    }

    const start = buildDateTime(startRaw, startHours, startMinutes);
    const end = buildDateTime(startRaw, endHours, endMinutes);

    const newLesson = await db.lesson.create({
      data: {
        courseId: courseId,
        startDate: start,
        endDate: end,
        teacherId: parseInt(teacherId),
        repeat: repeat,
        duration: duration,
        createdAt: new Date(),
      },
    });

    await db.attendance.create({
      data: {
        lessonId: originalLessonId,
        userId: originalLesson.course.studentId,
        createdAt: new Date(),
        type: "replacement",
      },
    });

    await db.replacement.create({
      data: {
        originalLessonId: originalLesson.id,
        substituteLessonId: newLesson.id,
        studentId: originalLesson.course.studentId,
        teacherId: parseInt(teacherId),
        note: note,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Náhrada byla úspěšně vytvořena" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Chyba při vytváření náhrady" },
      { status: 500 },
    );
  }
}
