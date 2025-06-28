import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Holiday } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: Holiday | null;
  type?: string;
}

export default function CreateUpdateHolidaysModal({
  isOpen,
  onClose,
  data,
  type,
}: Props) {
  const FormSchema = z
    .object({
      name: z.string().min(1, "Jméno je povinné"),
      startDate: z.string().min(1, "Začátek je povinný"),
      endDate: z.string().min(1, "Konec je povinný"),
    })
    .refine(
      (data) => {
        return data.endDate > data.startDate;
      },
      {
        path: ["endDate"],
        message: "Datum konce musí být po začátku",
      },
    );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [message, setMessage] = useState("");

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  useEffect(() => {
    if (data && isOpen) {
      reset({
        name: data.name || "",
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
      });
    }
  }, [data, isOpen, reset]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const body =
        type === "update"
          ? JSON.stringify({ values, id: data?.id })
          : JSON.stringify(values);

      const method = type === "update" ? "PUT" : "POST";

      const response = await fetch("/api/holidays", {
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
            ? "Chyba při úpravě kurzu."
            : "Chyba při vytváření kurzu.",
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
        {type === "update" && <h2 className="title">Upravit prázdniny</h2>}
        {type === "create" && <h2 className="title">Vytvořit prázdniny</h2>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="col-span-2 mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Jméno prázdnin*</label>
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
              <label className="text-xs text-gray-500">Začátek prázdnin*</label>
              <input
                type="date"
                {...register("startDate", { required: true })}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Konec prázdnin*</label>
              <input
                type="date"
                {...register("endDate", { required: true })}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.endDate && (
                <p className="text-xs text-red-500">{errors.endDate.message}</p>
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
