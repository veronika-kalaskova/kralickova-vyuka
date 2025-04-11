"use client";
import React, { useState } from "react";
import CreateUpdateLessonModal from "../forms/CreateUpdateLessonModal";
import { Course, User } from "@prisma/client";
import Button from "../Button";

interface Props {
  //   coursesWithoutLector: (Course & { group: Group | null })[];
  //   coursesWithoutStudent: (Course & { group: Group | null })[];
  //   coursesWithoutGroup: Course[];
  //   allLectors: User[];
  roles?: string[];
  course: Course & { teacher: User | null };
}

export default function CourseDetail({ roles, course }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = roles?.includes("admin");

  const openModal = () => {
    setIsOpen(true);
  };
  return (
    <div>
      <Button title="Vytvořit lekci" onClick={() => openModal()} />
      <CreateUpdateLessonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type="create"
        course={course}
      />
    </div>
  );
}
