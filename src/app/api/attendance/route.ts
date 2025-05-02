import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessonId, attendanceData } = body;

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Lekce nenalezena" },
        { status: 404 },
      );
    }

    await db.attendance.createMany({
      data: attendanceData,
    });

    return NextResponse.json(
      { message: "Docházka byla úspěšně zaznamenána" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Chyba při vytváření docházky:", error);
    return NextResponse.json(
      { message: "Chyba při zpracování docházky" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { lessonId, attendanceData } = body;

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Lekce nenalezena" },
        { status: 404 },
      );
    }

    await db.attendance.deleteMany({
      where: { lessonId },
    });

    await db.attendance.createMany({
      data: attendanceData,
    });

    return NextResponse.json(
      { message: "Docházka byla úspěšně aktualizována" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chyba při aktualizaci docházky:", error);
    return NextResponse.json(
      { message: "Chyba při aktualizaci docházky" },
      { status: 500 },
    );
  }
}
