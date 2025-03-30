import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, firstName, lastName, phone, email, courseIds, roleId, class: studentClass, pickup } = body

    const hashedPassword = await hash(password, 10);

    const existingUser = await db.user.findFirst({
      where: {
      OR: [
        { username: username },
        { email: email }
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
        class: studentClass,
        pickup: pickup,
        UserRole: {
          create: {
            roleId: parseInt(roleId),
          },
        },
        CoursesTaken: courseIds && courseIds.length > 0
        ? {
            connect: courseIds.map((courseId: number) => ({ id: courseId })),
          }
        : undefined
    },
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
