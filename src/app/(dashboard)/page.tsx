import CalendarComponent from "@/components/Calendar";
import QuickActions from "@/components/QuickActions";
import { prisma } from "@/lib/db";

export default async function Home() {

  const courses = await prisma.course.findMany({
    where: {
      teacherId: null
    }
  });
  
  

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 md:flex-row md:items-start">
      {/* PREHLED LEKCI */}
      <div className="w-full md:w-3/4">
        <h1 className="title">Přehled lekcí</h1>
        <CalendarComponent />
      </div>

      <QuickActions courses={courses} />
    </div>
  );
}
