import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course, Group, User } from "@prisma/client";

// TODO: podminka u datumu

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lectors: User[];
  data?: Course | null;
  type?: string;
}

export default function CreateLectorModal({
  isOpen,
  onClose,
  lectors,
  data,
  type,
}: Props) {
  const FormSchema = z.object({
    name: z.string().min(1, "Jméno je povinné"),
    teacherId: z.string().min(1, "Lektor je povinný"),
    description: z.string().optional(),
    textbook: z.string().optional(),
    courseType: type === "create"
    ? z.enum(["individual", "pair", "group"], { required_error: "Typ kurzu je povinný" })
    : z.enum(["individual", "pair", "group"]).optional(),
    startDate: z.string().min(1, "Začátek je povinný"),
    endDate: z.string().min(1, "Konec je povinný"),
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
    defaultValues: {
        courseType: "individual"
    }
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data && isOpen) {
      reset({
        name: data.name || "",
        description: data.description || "",
        textbook: data.textbook || "",
        teacherId: data.teacherId?.toString() || "",
        startDate: data.startDate
          ? new Date(data.startDate).toISOString().split("T")[0]
          : "",
        endDate: data.endDate
          ? new Date(data.endDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [data, isOpen, reset]);


  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const { courseType, ...rest } = values;

    console.log("haloo")
    console.log(values)

    const courseData: any = {
      ...rest,
      isIndividual: courseType === "individual",
      isPair: courseType === "pair",
    };

    const body =
      type === "update"
        ? JSON.stringify({ ...courseData, id: data?.id })
        : JSON.stringify(courseData);

    const method = type === "update" ? "PUT" : "POST";

    const response = await fetch("/api/course", {
      method,
      body,
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      onClose();
      window.location.reload();
    } else {
      const errorData = await response.json();
      if (errorData.message === "Course exists") {
        setMessage("Kurz s tímto jménem již existuje.");
      } else {
        setMessage(
          type === "update"
            ? "Chyba při úpravě kurzu."
            : "Chyba při vytváření kurzu.",
        );
      }
    }
  };

  const courseType = watch("courseType");

  useEffect(() => {
    if (courseType === "group" || courseType === "pair") {
      setMessage("Nezapomeňte přiřadit skupinu přes Vytvořit skupinu.");
    }
  }, [courseType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        {type === "update" && <h2 className="title">Upravit kurz</h2>}
        {type === "create" && <h2 className="title">Vytvořit kurz</h2>}
        <form onSubmit={handleSubmit(onSubmit, (errors) => {
  console.log("formulář má chyby", errors);
})}>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Jméno kurzu*</label>
              <input
                type="text"
                {...register("name")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Učebnice</label>
              <input
                {...register("textbook")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.textbook && (
                <p className="text-xs text-red-500">
                  {errors.textbook.message}
                </p>
              )}
            </div>

            <div className="col-span-2 mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Popis kurzu</label>
              <textarea
                {...register("description")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {type === "create" && (
              <div className="col-span-2 mb-4 flex flex-col gap-2">
                <label className="text-xs text-gray-500">Typ kurzu*</label>
                <select
                  {...register("courseType")}
                  className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                >
                  <option value="individual">Individuální</option>
                  <option value="pair">Párový</option>
                  <option value="group">Skupinový</option>
                </select>
                {errors.courseType && (
                  <p className="text-xs text-red-500">
                    {errors.courseType.message}
                  </p>
                )}
              </div>
            )}

            <div className="col-span-2 mb-4 flex w-full flex-col gap-2">
              <label className="text-xs text-gray-500">Vyberte lektora*</label>
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

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Začátek kurzu*</label>
              <input
                type="date"
                {...register("startDate", { required: true })}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Konec kurzu*</label>
              <input
                type="date"
                {...register("endDate", { required: true })}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
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
