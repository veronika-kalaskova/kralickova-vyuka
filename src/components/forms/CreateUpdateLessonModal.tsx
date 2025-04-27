"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Course, Lesson, User } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  course: Course & { teacher: User | null };
  data?: Lesson | null;
  type?: string;
}

export default function CreateUpdateLessonModal({
  isOpen,
  onClose,
  course,
  data,
  type,
}: Props) {
  const FormSchema = z.object({
    date: z.string().min(1, "Zadejte datum"),
    startTime: z.string().min(1, "Zadejte čas začátku"),
    endTime: z.string().min(1, "Zadejte čas konce"),
    repeat: z.enum(["none", "weekly"]),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data && isOpen) {
      reset({
        startTime: data.startDate.toISOString().split("T")[1].slice(0, 5),
        endTime: data.endDate.toISOString().split("T")[1].slice(0, 5),
        repeat: data.repeat === "weekly" ? "weekly" : "none",
      });
    }
  }, [data, isOpen, reset]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const { date, startTime, endTime, repeat } = values;

      const startDate = new Date(`${date}T${startTime}`);
      const endDate = new Date(`${date}T${endTime}`);

      const lessonData = {
        courseId: course.id,
        date: new Date(date),
        startDate,
        endDate,
        repeat,
      };

      const body =
        type === "update"
          ? JSON.stringify({ ...lessonData, id: data?.id })
          : JSON.stringify(lessonData);

      const method = type === "update" ? "PUT" : "POST";

      const response = await fetch("/api/lesson", {
        method,
        body,
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        setMessage(
          type === "update"
            ? "Chyba při úpravě lekce."
            : "Chyba při vytváření lekce.",
        );
      }
    } catch (error) {
      console.error("Chyba při odesílání formuláře:", error);
      setMessage("Nastala neočekávaná chyba.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        <h2 className="title">
          {type === "update" ? "Upravit lekci" : "Vytvořit lekci"}
        <p className="text-xs font-normal mt-4 text-gray-500">Tento kurz učí {course.teacher?.firstName} {course.teacher?.lastName} a trvá od {course.startDate.toLocaleDateString()} do {course.endDate.toLocaleDateString()}</p>
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="col-span-2 mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Datum lekce*</label>
              <input
                type="date"
                {...register("date")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Čas začátku*</label>
              <input
                type="time"
                {...register("startTime")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.startTime && (
                <p className="text-xs text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Čas konce*</label>
              <input
                type="time"
                {...register("endTime")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.endTime && (
                <p className="text-xs text-red-500">{errors.endTime.message}</p>
              )}
            </div>

            <div className="col-span-2 mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Opakování*</label>
              <select
                {...register("repeat")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              >
                <option value="none">Neopakovat</option>
                <option value="weekly">Týdně</option>
              </select>
              {errors.repeat && (
                <p className="text-xs text-red-500">{errors.repeat.message}</p>
              )}
            </div>

            {message && (
              <div className="col-span-2 mt-2 text-xs text-red-500">
                {message}
              </div>
            )}

            <div className="col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-800 transition-all hover:bg-orange-100"
              >
                Zavřít
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-orange-400 px-4 py-3 font-medium text-white transition-all hover:bg-orange-500"
              >
                {type === "update" ? "Upravit" : "Vytvořit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
