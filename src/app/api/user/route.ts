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
      color,
    } = body;

    const hashedPassword = await hash(password, 10);

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username: username, deletedAt: null },
          { email: email, deletedAt: null }, // uzivatel, u ktereho je bud username neboo email stejny
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

    const newUser = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        color: color,
        UserRole: {
          create: {
            roleId: parseInt(roleId),
          },
        },
        CoursesTaught: {
          connect: courseIds.map((courseId: number) => ({
            // pripoji veskere kurzy
            id: courseId,
          })),
        },
      },
    });

    await db.group.updateMany({
      where: { Course: { some: { id: { in: courseIds } } } }, // nastavi skupiny
      data: { teacherId: newUser.id },
    });

    await db.lesson.updateMany({
      where: { courseId: { in: courseIds } },
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
      color,
    } = body;

    const existingUser = await db.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },

          {
            OR: [
              { username: username, deletedAt: null },
              { email: email, deletedAt: null },
            ],
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
        color,
        CoursesTaught: {
          set: courseIds.map((courseId: number) => ({ id: courseId })),
        },
      },
    });

    await db.group.updateMany({
      where: { Course: { some: { id: { in: courseIds } } } },
      data: { teacherId: id },
    });

    await db.lesson.updateMany({
      where: { courseId: { in: courseIds } },
      data: { teacherId: updatedUser.id },
    });

    return NextResponse.json(
      { user: updatedUser, message: "uzivatel upraven" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
