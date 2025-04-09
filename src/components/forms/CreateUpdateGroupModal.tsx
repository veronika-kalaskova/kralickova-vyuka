import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course, Group, User } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  data?: (Group & { Courses?: Course[] }) | null;
  type?: string;
  lectors: User[];
}

export default function CreateLectorModal({
  isOpen,
  onClose,
  courses,
  data,
  type,
  lectors,
}: Props) {
  const FormSchema = z.object({
    name: z.string().min(1, "Jméno je povinné"),
    courseId: z.string().min(1, "Kurz je povinný"),
    teacherId: z.string().min(1, "Lektor je povinný"),
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
        name: data.name || "",
        courseId: data.Courses?.at(0)?.id.toString(),
        teacherId: data.teacherId?.toString() || "",
      });
    }
  }, [data, isOpen, reset]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const courseId = values.courseId;

    const body =
      type === "update"
        ? JSON.stringify({ ...values, id: data?.id, courseId })
        : JSON.stringify({ ...values, courseId });

    const method = type === "update" ? "PUT" : "POST";

    const response = await fetch("/api/group", {
      method,
      body,
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      onClose();
      window.location.reload();
    } else {
      const errorData = await response.json();
      if (errorData.message === "Group exists") {
        setMessage("Skupina s tímto jménem již existuje.");
      }  else {
        setMessage(
          type === "update"
            ? "Chyba při úpravě skupiny."
            : "Chyba při vytváření skupiny.",
        );
      }
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        {type === "update" && <h2 className="title">Upravit skupinu</h2>}
        {type === "create" && <h2 className="title">Vytvořit skupinu</h2>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="col-span-2 mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Jméno skupiny*</label>
              <input
                type="text"
                {...register("name")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {type === "create" && (
              <div className="col-span-2 mb-4 flex w-full flex-col gap-2">
                <label className="text-xs text-gray-500">Vyberte kurz(y)</label>
                <p className="text-[10px] text-gray-500">
                  Jedná se pouze o kurzy, které nemají přiřazenou skupinu a jsou
                  nastavené jako skupinové
                </p>
                <select
                  {...register("courseId")}
                  className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="text-xs text-red-500">
                    {errors.courseId.message}
                  </p>
                )}
              </div>
            )}

            {type === "create" && (
              <div className="col-span-2 mb-4 flex w-full flex-col gap-2">
                <label className="text-xs text-gray-500">Vyberte lektora</label>
                <select
                  {...register("teacherId")}
                  className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                >
                  {lectors.map((lector) => (
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

            {/* {type === "update" && data?.CoursesTaught && (
              <div className="col-span-2 mb-4 flex w-full flex-col gap-2">
                <label className="text-xs text-gray-500">Kurzy lektora</label>
                <select
                  multiple
                  {...register("courseIds")}
                  className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                >
                  {data?.CoursesTaught.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseIds && (
                  <p className="text-xs text-red-500">
                    {errors.courseIds.message}
                  </p>
                )}
              </div>
            )} */}

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
