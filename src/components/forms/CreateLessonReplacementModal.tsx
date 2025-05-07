"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Course, Lesson, User } from "@prisma/client";
import emailjs from "@emailjs/browser";
import nextConfig from "../../../next.config";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson & { course: Course & { student: User | null } } & {
    teacher: User;
  };
  lectors: User[];
}

const FormSchema = z.object({
  date: z.string().min(1, "Zadejte datum"),
  startTime: z.string().min(1, "Zadejte čas začátku"),
  endTime: z.string().min(1, "Zadejte čas konce"),
  teacherId: z.string().optional(),
  note: z.string().optional(),
});

export default function CreateLessonReplacement({
  isOpen,
  onClose,
  lesson,
  lectors,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [message, setMessage] = useState("");

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const [year, month, day] = values.date.split("-").map(Number);
      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const [endHour, endMinute] = values.endTime.split(":").map(Number);

      const startDate = new Date(year, month - 1, day, startHour, startMinute);
      const endDate = new Date(year, month - 1, day, endHour, endMinute);

      const data = {
        courseId: lesson.course.id,
        date: new Date(values.date),
        startDate: startDate,
        endDate: endDate,
        teacherId: values.teacherId,
        repeat: "none",
        originalLessonId: lesson.id,
        note: values.note,
        studentId: lesson.course.student?.id,
      };

      const body = JSON.stringify(data);

      const response = await fetch("/api/replacement", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      });

      const templateParams = {
        oldLesson: formatTime(lesson.startDate, lesson.endDate).toString(),
        newLesson: formatTime(startDate, endDate).toString(),
        to_email: lesson.teacher.email,
        lessonName: lesson.course.name.toString(),
      };

      emailjs
        .send(
          process.env.NEXT_PUBLIC_SERVICE_KEY!,
          process.env.NEXT_PUBLIC_TEMPLATE_KEY!,
          templateParams,
          process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        )
        .then(
          () => {
            console.log("SUCCESS!");
          },
          (error: any) => {
            console.log("FAILED...", error.text);
          },
        );

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        setMessage("Chyba při vytváření náhrady.");
      }
    } catch (error) {
      console.error("Chyba při odesílání formuláře:", error);
      setMessage("Nastala neočekávaná chyba.");
    }
  };

  function formatTime(start: Date, end: Date): string {
    const formatStart = start.toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Prague",
    });

    const formatEnd = end.toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Prague",
    });

    return `${formatStart} - ${formatEnd}`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        <h2 className="mb-4 text-lg font-semibold">Náhradní lekce</h2>
        <p className="mb-4 text-xs text-gray-500">
          Nahrazuje se lekce {formatTime(lesson.startDate, lesson.endDate)}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <label className="text-xs text-gray-500">
              Datum náhradní lekce*
            </label>
            <input
              type="date"
              {...register("date")}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-gray-300 p-2"
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">
              Čas začátku náhradní lekce*
            </label>
            <input
              type="time"
              {...register("startTime")}
              className="w-full rounded-md border border-gray-300 p-2"
            />
            {errors.startTime && (
              <p className="text-xs text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">
              Čas konce náhradní lekce*
            </label>
            <input
              type="time"
              {...register("endTime")}
              className="w-full rounded-md border border-gray-300 p-2"
            />
            {errors.endTime && (
              <p className="text-xs text-red-500">{errors.endTime.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">Lektor*</label>
            <select
              {...register("teacherId")}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              {lectors.map((lector) => (
                <option key={lector.id} value={lector.id}>
                  {lector.firstName} {lector.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Poznámka</label>
            <textarea
              {...register("note")}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {message && <p className="text-xs text-red-500">{message}</p>}

          <p className="mb-4 text-xs text-gray-500">
            Studentovi {lesson.course.student?.firstName}{" "}
            {lesson.course.student?.lastName} bude nahrazena lekce a bude mu za
            lekci{" "}
            <strong className="text-black">
              {formatTime(lesson.startDate, lesson.endDate)}
            </strong>{" "}
            udělena <strong className="text-red-500">nepřítomnost</strong>.
          </p>

          <div className="flex justify-end gap-2">
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
              Zadat náhradu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
