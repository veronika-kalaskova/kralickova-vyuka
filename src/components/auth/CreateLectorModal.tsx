import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course } from "@prisma/client";

const FormSchema = z.object({
  firstName: z.string().min(1, "Jméno je povinné"),
  lastName: z.string().min(1, "Příjmení je povinné"),
  username: z.string().min(1, "Příjmení je povinné"),
  password: z.string().min(1, "Heslo je povinné"),
  phone: z.string().min(1, "Telefon je povinný"),
  email: z.string().email("Neplatná e-mailová adresa"),
  courseIds: z.array(z.string()).optional(),
});

interface Props {
  roleId: number;
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export default function CreateLectorModal({
  roleId,
  isOpen,
  onClose,
  courses,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [message, setMessage] = useState("");

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const courseIds = values.courseIds?.map((id) => parseInt(id, 10));

    const response = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ ...values, roleId: roleId, courseIds: courseIds }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      onClose();
    } else {
      const errorData = await response.json();
      if (errorData.message === "User exists") {
        setMessage("Uživatel s tímto jménem nebo e-mailem již existuje.");
      } else {
        setMessage("Chyba při vytváření uživatele.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#0000007e]">
      <div className="w-[400px] rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold">Vytvořit lektora</h2>
        <p className="text-sm text-gray-600">Role ID: {roleId}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Jméno*</label>
            <input
              {...register("firstName")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Příjmení*</label>
            <input
              {...register("lastName")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">username*</label>
            <input
              {...register("username")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Telefon*</label>
            <input
              {...register("phone")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium">E-mail*</label>
            <input
              {...register("email")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Priradit kurz, ktery bude lektor ucit</label>
            <p>POZNAMKA: vybiram pouze kurz, kde neni nastaven lektor</p>
            <input
              {...register("kurzId")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.kurzId && (
              <p className="text-sm text-red-500">{errors.kurzId.message}</p>
            )}

            
          </div> */}

          <div>
            <label className="block text-sm font-medium">Vyberte kurzy</label>
            <select
              multiple
              {...register("courseIds")}
              className="w-full rounded-md border px-3 py-2"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.courseIds && (
              <p className="text-sm text-red-500">{errors.courseIds.message}</p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium">Vyberte kurz</label>
            <select {...register("kurzId")} className="w-full rounded-md border px-3 py-2">
              <option value="">Vyberte kurz</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.kurzId && <p className="text-sm text-red-500">{errors.kurzId.message}</p>}
          </div> */}

          <div>
            <label className="block text-sm font-medium">email*</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Heslo*</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border px-3 py-2"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {message && <div className="mt-2 text-sm">{message}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Zavřít
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              Vytvořit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
