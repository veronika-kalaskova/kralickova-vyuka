import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, startDate, endDate } = body;

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    const duration = Math.round(
      (parsedEnd.getTime() - parsedStart.getTime()) / 60000,
    );

    const updatedLesson = await db.lesson.update({
      where: { id },
      data: {
        startDate: parsedStart,
        endDate: parsedEnd,
        duration: duration,
      },
    });

    return NextResponse.json(
      { course: updatedLesson, message: "lekce upravena" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chyba při aktualizaci lekce:", error);
    return NextResponse.json(
      { message: "Chyba při aktualizaci lekce" },
      { status: 500 },
    );
  }
}
