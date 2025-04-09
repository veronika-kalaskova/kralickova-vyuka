import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, courseId, teacherId } = body;

    const existingGroup = await db.group.findFirst({
      where: {
        name: name,
        deletedAt: null,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        {
          message: "Group exists",
        },
        { status: 409 },
      );
    }

    const newGroup = await db.group.create({
      data: {
        name,
        teacherId: parseInt(teacherId),
        Course: {
          connect: {
            id: parseInt(courseId),
          },
        },
      },
    });

    await db.user.update({
      where: { id: parseInt(teacherId) },
      data: {
        CoursesTaught: {
          connect: { id: parseInt(courseId) },
        },
      },
    });

    return NextResponse.json(
      { group: newGroup, message: "skupina vytvorena" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// export async function PUT(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       id,
//       username,
//       firstName,
//       lastName,
//       phone,
//       email,
//       courseIds,
//       roleId,
//     } = body;

//     const existingUser = await db.user.findFirst({
//       where: {
//         AND: [
//           { id: { not: id } },

//           {
//             OR: [
//               { username: username, deletedAt: null },
//               { email: email, deletedAt: null },
//             ],
//           },
//         ],
//       },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         {
//           message: "User exists",
//         },
//         { status: 409 },
//       );
//     }

//     await db.group.updateMany({
//       where: { teacherId: id },
//       data: { teacherId: null },
//     });

//     const updatedUser = await db.user.update({
//       where: { id: id },
//       data: {
//         username,
//         firstName,
//         lastName,
//         phone,
//         email,
//         CoursesTaught: {
//           set: courseIds.map((courseId: number) => ({ id: courseId })),
//         },
//       },
//     });

//     await db.group.updateMany({
//       where: { Course: { some: { id: { in: courseIds } } } },
//       data: { teacherId: id },
//     });

//     return NextResponse.json(
//       { user: updatedUser, message: "uzivatel upraven" },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Error" }, { status: 500 });
//   }
// }
