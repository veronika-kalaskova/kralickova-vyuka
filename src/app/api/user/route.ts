import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      username,
      password,
      firstName,
      lastName,
      phone,
      email,
      courseIds,
      roleId,
    } = body;

    const hashedPassword = await hash(password, 10);

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User exists",
        },
        { status: 409 },
      );
    }

    const newUser = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        UserRole: {
          create: {
            roleId: parseInt(roleId),
          },
        },
        CoursesTaught:
          courseIds && courseIds.length > 0
            ? {
                connect: courseIds.map((courseId: number) => ({
                  id: courseId,
                })),
              }
            : undefined,
      },
    });

    await db.group.updateMany({
      where: { Course: { some: { id: { in: courseIds } } } },
      data: { teacherId: newUser.id },
    });

    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json(
      { user: rest, message: "uzivatel vytvoren" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      username,
      firstName,
      lastName,
      phone,
      email,
      courseIds,
      roleId,
    } = body;

    const existingUser = await db.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [{ username: username }, { email: email }],
          },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User exists",
        },
        { status: 409 },
      );
    }

    await db.group.updateMany({
      where: { teacherId: id },
      data: { teacherId: null },
    });

    const updatedUser = await db.user.update({
      where: { id: id },
      data: {
        username,
        firstName,
        lastName,
        phone,
        email,
        CoursesTaught: {
          set: courseIds.map((courseId: number) => ({ id: courseId })),
        },
      },
    });

    await db.group.updateMany({
      where: { Course: { some: { id: { in: courseIds } } } },
      data: { teacherId: id },
    });

    return NextResponse.json(
      { user: updatedUser, message: "uzivatel upraven" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error); // Pro lepší debugování
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
