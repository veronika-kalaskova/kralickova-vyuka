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

  const allLessons = await prisma.lesson.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      course: {
        include: {
          teacher: true,
          student: true
        }
      },
      teacher: true,
    }
  });
  
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 xl:flex-row xl:items-start">
      {/* PREHLED LEKCI */}
      <div className="w-full">
        <h1 className="title">Přehled lekcí</h1>
        <CalendarComponent lessons={allLessons} roles={session?.user.roles} />
      </div>

      <QuickActions roles={session?.user.roles} coursesWithoutLector={coursesWithoutLector} coursesWithoutStudent={coursesWithoutStudent} coursesWithoutGroup={coursesWithoutGroup} allLectors={allLectors} />
    </div>
  );
}
