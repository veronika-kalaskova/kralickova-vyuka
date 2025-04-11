import CourseDetail from "@/components/detail/CourseDetail";
import CreateUpdateLessonModal from "@/components/forms/CreateUpdateLessonModal";
import { prisma } from "@/lib/db";
import React from "react";

export default async function Kurz({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id: parseInt(id) },
    include: {
      teacher: true,
    },
  });

  if (!course) {
    return (
      <div className="p-4">
        <h1 className="title">Kurz nenalezen</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <CourseDetail course={course} />
    </div>
  );
}
