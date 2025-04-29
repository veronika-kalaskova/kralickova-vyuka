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
  lectors?: User[];
}

export default function CreateUpdateLessonModal({
  isOpen,
  onClose,
  course,
  data,
  type,
  lectors
}: Props) {
  const FormSchema = z.object({
    date: z.string().min(1, "Zadejte datum"),
    startTime: z.string().min(1, "Zadejte čas začátku"),
    endTime: z.string().min(1, "Zadejte čas konce"),
    teacherId: z.string().optional(),
    repeat:
      type === "create"
        ? z.enum(["none", "weekly"], {
            required_error: "Opakování je povinné",
          })
        : z.enum(["none", "weekly"]).optional(),
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

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }
  
  function formatTime(date: Date) {
    return date.toTimeString().slice(0, 5); 
  }

  useEffect(() => {
    if (data && isOpen) {
      reset({
        date: formatDate(data.startDate),
        startTime: formatTime(data.startDate),
        endTime: formatTime(data.endDate),
        repeat: data.repeat === "weekly" ? "weekly" : "none",
        teacherId: data.teacherId?.toString() || "",
      });
      
    }
  }, [data, isOpen, reset]);



  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const { date, startTime, endTime, repeat } = values;

      const [year, month, day] = values.date.split("-").map(Number);
      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const [endHour, endMinute] = values.endTime.split(":").map(Number);
      
      const startDate = new Date(year, month - 1, day, startHour, startMinute);
      const endDate = new Date(year, month - 1, day, endHour, endMinute);
      

      const lessonData = {
        courseId: course.id,
        date: new Date(date),
        teacherId: type === "create" ? course.teacher?.id : values.teacherId,
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
          <p className="mt-4 text-xs font-normal text-gray-500">
            Tento kurz učí {course.teacher?.firstName}{" "}
            {course.teacher?.lastName} a trvá od{" "}
            {course.startDate.toLocaleDateString()} do{" "}
            {course.endDate.toLocaleDateString()}
          </p>
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
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

            {type === "create" && (
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
            )}

{type === "update" && (
            <div className="col-span-2 mb-4 flex w-full flex-col gap-2">
            <label className="text-xs text-gray-500">Vyberte lektora pro konktrétní lekci*</label>
            <select
              {...register("teacherId")}
              className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
            >
              {lectors?.map((lector) => (
                <option key={lector.id} value={lector.id}>
                  {lector.firstName} {lector.lastName}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="text-xs text-red-500">
                {errors.teacherId.message}
              </p>
            )}
          </div>
            )}

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
