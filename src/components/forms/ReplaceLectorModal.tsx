"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { User, Course } from "@prisma/client";

type LectorType = User & { CoursesTaught: Course[] };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lectors: User[];
  deletedLectorId: number | null;
}

export default function ReplaceLectorModal({
  isOpen,
  onClose,
  lectors,
  deletedLectorId
}: Props) {
  const [message, setMessage] = useState("");

  const FormSchema = z.object({
    newLectorId: z.string().min(1, "Vyberte lektora"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      newLectorId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      if (!deletedLectorId) {
        setMessage("Chybí ID původního lektora.");
        return;
      }

      const res = await fetch("/api/user/delete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldLectorId: deletedLectorId,
          newLectorId: parseInt(values.newLectorId),
        }),
      });

      if (res.ok) {
        onClose();
        window.location.reload();
      } else {
        setMessage("Chyba při nahrazování lektora.");
      }
    } catch (error) {
      setMessage("Nastala chyba.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        <h2 className="title">Vyberte lektora, který převezme lekce</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 flex flex-col gap-2">
            <label className="text-xs text-gray-500">Nový lektor*</label>
            <select
              {...register("newLectorId")}
              className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
            >
              <option value="">Vyberte lektora</option>
              {lectors.map((lector) => (
                <option key={lector.id} value={lector.id}>
                  {lector.firstName} {lector.lastName}
                </option>
              ))}
            </select>
            {errors.newLectorId && (
              <p className="text-xs text-red-500">{errors.newLectorId.message}</p>
            )}
          </div>

          {message && (
            <div className="mt-2 text-xs text-red-500">
              {message}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
            >
              Potvrdit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}