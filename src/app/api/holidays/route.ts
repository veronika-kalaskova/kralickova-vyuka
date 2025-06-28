import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      startDate,
      endDate,
    } = body;

    const newHolidays = await db.holiday.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(
      { holidays: newHolidays, message: "prázdniny vytvořeny" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "chyba při vytváření prázdnin" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, startDate, endDate } =
      body;

    const updatedHolidays = await db.holiday.update({
      where: { id },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(
      { holidays: updatedHolidays, message: "prazdniny upraveny" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Nastala chyba." }, { status: 400 });
    }

    const deletedHolidays = await db.holiday.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "prazdniny smazany." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Chyba při mazání prazdnin." },
      { status: 500 },
    );
  }
}