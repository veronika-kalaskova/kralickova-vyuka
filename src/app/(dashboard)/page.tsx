import CalendarComponent from "@/components/Calendar";
import QuickActions from "@/components/QuickActions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export default async function Home() {

  const session = await getServerSession(authOptions);

  const coursesWithoutLector = await prisma.course.findMany({
    where: {
      teacherId: null
    },
    include: {
      group: true
    }
  });

  const coursesWithoutStudent = await prisma.course.findMany({
    where: {
      studentId: null
    },
    include: {
      group: true
    }
  });

  const coursesWithoutGroup = await prisma.course.findMany({
    where: {
      groupId: null,
      isIndividual: false
    }
  })

  const allLectors = await prisma.user.findMany({
    where: {
      deletedAt: null,
      UserRole: {
        some: {
          roleId: 2,
        },
      },
    }
  });

  // const groups = await prisma.group.findMany({
  //   include: {
  //     Course: true,
  //   },
  // });
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 md:flex-row md:items-start">
      {/* PREHLED LEKCI */}
      <div className="w-full md:w-3/4">
        <h1 className="title">Přehled lekcí</h1>
        <CalendarComponent />
      </div>

      <QuickActions roles={session?.user.roles} coursesWithoutLector={coursesWithoutLector} coursesWithoutStudent={coursesWithoutStudent} coursesWithoutGroup={coursesWithoutGroup} allLectors={allLectors} />
    </div>
  );
}
