"use client";
import React, { useState } from "react";
import Button from "./Button";
import CreateLectorModal from "./auth/CreateLectorModal";
import CreateStudentModal from "./auth/CreateStudentModal";
import { Course, Group, User } from "@prisma/client";
import CreateUpdateGroupModal from "./forms/CreateUpdateGroupModal";
import CreateUpdateCourseModal from "./forms/CreateUpdateCourseModal";

interface Props {
  coursesWithoutLector: (Course & { group: Group | null })[];
  coursesWithoutStudent: (Course & { group: Group | null })[];
  coursesWithoutGroup: Course[];
  allLectors: User[];
  roles?: string[];
}

export default function QuickActions({
  coursesWithoutLector,
  coursesWithoutStudent,
  coursesWithoutGroup,
  allLectors,
  roles,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [roleId, setRoleId] = useState(0);
  const [modal, setModal] = useState("");

  const isAdmin = roles?.includes("admin");

  const openUserModal = (id: number) => {
    setModal("");
    setIsOpen(true);
    setRoleId(id);
  };

  const openModal = (name: string) => {
    setRoleId(0);
    setIsOpen(true);
    setModal(name);
  };

  return (
    <>
      {isAdmin && (
        <>
          {/* RYCHLE AKCE */}
          <div className="w-full md:w-1/4">
            <h2 className="title">Rychlé akce</h2>
            <div className="flex flex-col gap-3">
              <Button title="Přidat lekci" />
              <Button
                title="Vytvořit lektora"
                onClick={() => openUserModal(2)}
              />
              <Button
                title="Vytvořit studenta"
                onClick={() => openUserModal(3)}
              />
              <Button
                title="Vytvořit skupinu"
                onClick={() => openModal("group")}
              />
              <Button
                title="Vytvořit kurz"
                onClick={() => openModal("course")}
              />
            </div>
          </div>

          {/* MODAL */}
          {roleId === 2 && (
            <CreateLectorModal
              roleId={roleId}
              isOpen={isOpen}
              courses={coursesWithoutLector}
              onClose={() => setIsOpen(false)}
              type="create"
            />
          )}

          {roleId === 3 && (
            <CreateStudentModal
              roleId={roleId}
              isOpen={isOpen}
              courses={coursesWithoutStudent}
              onClose={() => setIsOpen(false)}
              type="create"
            />
          )}

          {modal === "group" && (
            <CreateUpdateGroupModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              courses={coursesWithoutGroup}
              lectors={allLectors}
              type="create"
            />
          )}

          {modal === "course" && (
            <CreateUpdateCourseModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              lectors={allLectors}
              type="create"
            />
          )}
        </>
      )}
    </>
  );
}
