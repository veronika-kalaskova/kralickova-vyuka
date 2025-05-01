// import CalendarComponent from "@/components/Calendar";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";
// import Student from "../seznam-studentu/[id]/page";
// import Lektor from "../seznam-lektoru/[id]/page";

// export default async function MujProfil() {
//   const session = await getServerSession(authOptions);

//   const loggedUser = await prisma.user.findFirst({
//     where: {
//       username: session?.user.username,
//     },
//     include: {
//       UserRole: {
//         include: {
//           role: true,
//         },
//       },
//       CoursesTaught: {
//         where: {
//           deletedAt: null,
//         },
//         include: {
//           group: true,
//         },
//       },
//       CoursesTaken: {
//         where: {
//           deletedAt: null,
//         },
//         include: {
//           group: true,
//         },
//       },
//       StudentGroup: {
//         where: {
//           deletedAt: null,
//         },
//         include: {
//           group: {
//             include: {
//               Course: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const lessons = await prisma.lesson.findMany({
//     where: {
//       teacherId: loggedUser?.id,
//       deletedAt: null,
//     },
//     include: {
//       course: {
//         include: {
//           teacher: true,
//         },
//       },
//       teacher: true,
//     },
//   });

//   return (
//     {loggedUser.UserRole[0].role.name === "Student" ? (
//       <Student />
//     ) : (
//       <Lektor params={loggedUser.id} />
//     )}
//   );
// }
