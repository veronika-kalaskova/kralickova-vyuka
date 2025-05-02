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
      class: studentClass,
      pickup,
    } = body;

    const hashedPassword = await hash(password, 10);

    const existingUser = await db.user.findFirst({
      where: {
        deletedAt: null,
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

    const invalidCourses = await db.course.findMany({
      where: {
        id: { in: courseIds },
        OR: [{ isIndividual: false }, { isPair: true }],
        groupId: null,
      },
    });

    if (invalidCourses.length > 0) {
      return NextResponse.json(
        {
          invalidCourses: invalidCourses,
          message: "Group course without groupId.",
        },
        { status: 400 },
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
        class: studentClass,
        pickup: pickup,
        UserRole: {
          create: {
            roleId: parseInt(roleId),
          },
        },
      },
    });

    const individualCourses = await db.course.findMany({
      where: {
        id: { in: courseIds },
        isIndividual: true,
      },
    });

    if (individualCourses.length > 0) {
      await db.user.update({
        where: { id: newUser.id },
        data: {
          CoursesTaken: {
            connect: individualCourses.map((course) => ({ id: course.id })),
          },
        },
      });
    }

    const groups = await db.group.findMany({
      where: {
        Course: {
          some: {
            id: { in: courseIds },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (groups.length > 0) {
      await db.studentGroup.createMany({
        data: groups.map((group) => ({
          studentId: newUser.id,
          groupId: group.id,
        })),
      });
    }

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
      studentClass,
      pickup,
    } = body;

    const existingUser = await db.user.findFirst({
      where: {
        deletedAt: null,
        AND: [
          { id: { not: id } },
          {
            OR: [{ username: username }, { email: email }],
          },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: "user exists" }, { status: 409 });
    }

    const invalidCourses = await db.course.findMany({
      where: {
        id: { in: courseIds },
        OR: [{ isIndividual: false }, { isPair: true }],
        groupId: null,
      },
    });

    if (invalidCourses.length > 0) {
      return NextResponse.json(
        {
          invalidCourses: invalidCourses,
          message: "Group course without groupId.",
        },
        { status: 400 },
      );
    }

    const updatedUser = await db.user.update({
      where: { id: id },
      data: {
        username,
        firstName,
        lastName,
        phone,
        email,
        class: studentClass,
        pickup: pickup,
      },
    });

    const individualCourses = await db.course.findMany({
      where: {
        id: { in: courseIds },
        isIndividual: true,
      },
    });

    await db.user.update({
      where: { id },
      data: {
        CoursesTaken: {
          set: individualCourses.map((course) => ({ id: course.id })),
        },
      },
    });

    const groups = await db.group.findMany({
      where: {
        Course: {
          some: {
            id: { in: courseIds },
          },
        },
      },
      select: { id: true },
    });

    await db.studentGroup.deleteMany({
      where: { studentId: id },
    });

    if (groups.length > 0) {
      await db.studentGroup.createMany({
        data: groups.map((group) => ({
          studentId: id,
          groupId: group.id,
        })),
      });
    }

    return NextResponse.json(
      { user: updatedUser, message: "uzivatel upraven" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
