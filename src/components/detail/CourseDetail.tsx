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
      <div className="flex justify-end gap-2">
        {roles?.includes("admin") && (
          <button
            type="button"
            onClick={openModal}
            className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
          >
            Vytvořit lekci
          </button>
        )}
      </div>

      <CreateUpdateLessonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type="create"
        course={course}
      />
    </div>
  );
}
