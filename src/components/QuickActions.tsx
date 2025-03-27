"use client";
import React, { useState } from "react";
import Button from "./Button";
import CreateLectorModal from "./auth/CreateLectorModal";
import CreateStudentModal from "./auth/CreateStudentModal";
import { Course } from "@prisma/client";

interface Props {
  courses: Course[]
}

export default function QuickActions({courses}:Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [roleId, setRoleId] = useState(0)

  const openModal = (id: number) => {
    setIsOpen(true)
    setRoleId(id)
  }

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
          courses={courses}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
