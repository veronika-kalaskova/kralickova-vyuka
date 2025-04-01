"use client";
import React, { useState } from "react";
import Button from "./Button";
import CreateLectorModal from "./auth/CreateLectorModal";
import CreateStudentModal from "./auth/CreateStudentModal";
import { Course, Group } from "@prisma/client";

interface Props {
  coursesWithoutLector: (Course & { group: Group | null })[];
  coursesWithoutStudent: (Course & { group: Group | null })[];
}

export default function QuickActions({ coursesWithoutLector, coursesWithoutStudent }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [roleId, setRoleId] = useState(0);

  const openModal = (id: number) => {
    setIsOpen(true);
    setRoleId(id);
  };

  return (
    <>
      {/* RYCHLE AKCE */}
      <div className="w-full md:w-1/4">
        <h2 className="title">Rychlé akce</h2>
        <div className="flex flex-col gap-3">
          <Button title="Přidat lekci" />
          <Button title="Vytvořit lektora" onClick={() => openModal(2)} />
          <Button title="Vytvořit studenta" onClick={() => openModal(3)} />
          <Button title="Přidat kurz" />
        </div>
      </div>

      {/* MODAL */}
      {roleId === 2 && (
        <CreateLectorModal
          roleId={roleId}
          isOpen={isOpen}
          courses={coursesWithoutLector}
          onClose={() => setIsOpen(false)}
        />
      )}

      {roleId === 3 && (
        <CreateStudentModal
          roleId={roleId}
          isOpen={isOpen}
          courses={coursesWithoutStudent}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
