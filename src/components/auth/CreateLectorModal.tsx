import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course, Group } from "@prisma/client";

// TODO: prejmenovat na createUpdateModal a presunout do forms slozky

interface Lector {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string | null;
  phone: string | null;
  color: string | null;
  createdAt: Date;
  CoursesTaught?: Course[];
}

interface Props {
  roleId: number;
  isOpen: boolean;
  onClose: () => void;
  courses: (Course & { group: Group | null })[];
  data?: Lector | null;
  type?: string;
}

export default function CreateLectorModal({
  roleId,
  isOpen,
  onClose,
  courses,
  data,
  type,
}: Props) {
  const FormSchema = z.object({
    firstName: z.string().min(1, "Jméno je povinné"),
    lastName: z.string().min(1, "Příjmení je povinné"),
    username: z.string().min(1, "Uživatelské jméno je povinné"),
    password:
      type === "create"
        ? z.string().min(1, "Heslo je povinné")
        : z.string().optional(),
    phone: z.string().min(1, "Telefon je povinný"),
    email: z.string().email("Neplatná e-mailová adresa"),
    courseIds: z.array(z.string()).optional(),
    color: z.string().optional(),
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

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const selectedCourses = watch("courseIds") || [];

  useEffect(() => {
    if (firstName && lastName && type === "create") {
      const suggestedUsername = `${firstName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")}.${lastName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")}`;
      setValue("username", suggestedUsername);
    }
  }, [firstName, lastName, setValue]);

  useEffect(() => {
    const groupCourses = selectedCourses
      .map((courseId) =>
        courses.find(
          (course) => course.id === parseInt(courseId) && course.group,
        ),
      )
      .filter(Boolean) as (Course & { group: Group })[];

    const group = groupCourses.map((course) => course.group);
    const name = group.map((group) => group.name).join(", ");

    if (groupCourses.length > 0) {
      const courseNames = groupCourses.map((course) => course.name).join(", ");
      setMessage(
        `Upozornění: Výběrem skupinového kurzu (${courseNames}) se lektor stává lektorem i pro skupinu: ${name}.`,
      );
    } else {
      setMessage("");
    }
  }, [selectedCourses, courses]);

  useEffect(() => {
    if (data && isOpen) {
      reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        phone: data.phone || "",
        email: data.email || "",
        courseIds:
          data.CoursesTaught?.map((course) => course.id.toString()) || [],
        color: data.color || "",
      });
    }
  }, [data, isOpen, reset]);

  const generatePassword = () => {
    var length = 8,
      charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }

    setValue("password", password);
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const courseIds = values.courseIds?.map((id) => parseInt(id, 10));

    const body =
      type === "update"
        ? JSON.stringify({ ...values, id: data?.id, roleId, courseIds })
        : JSON.stringify({ ...values, roleId, courseIds });

    const method = type === "update" ? "PUT" : "POST";

    const response = await fetch("/api/user", {
      method,
      body,
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      onClose();
      window.location.reload();
    } else {
      const errorData = await response.json();
      if (errorData.message === "User exists") {
        setMessage("Uživatel s tímto jménem nebo e-mailem již existuje.");
      } else {
        setMessage(
          type === "update"
            ? "Chyba při úpravě uživatele."
            : "Chyba při vytváření uživatele.",
        );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        {type === "update" && <h2 className="title">Upravit lektora</h2>}
        {type === "create" && <h2 className="title">Vytvořit lektora</h2>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Jméno*</label>
              <input
                type="text"
                {...register("firstName")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Příjmení*</label>
              <input
                {...register("lastName")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Email*</label>
              <input
                type="email"
                {...register("email")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Telefon*</label>
              <input
                {...register("phone")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {type === "create" && (
              <div className="col-span-2 mb-4 flex w-full flex-col gap-2">
                <label className="text-xs text-gray-500">Vyberte kurz(y)</label>
                <p className="text-[10px] text-gray-500">
                  Jedná se pouze o kurzy, které nemají přiřazeného lektora
                </p>
                <select
                  multiple
                  {...register("courseIds")}
                  className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                >
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
            )}

            {type === "update" && data?.CoursesTaught && (
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
            )}

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">
                Uživatelské jméno*
              </label>
              <input
                {...register("username")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.username && (
                <p className="text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Barva*</label>
              <input
                type="color"
                {...register("color")}
                className="h-10 w-14 rounded-md border-[1.5px] border-gray-300 p-1 focus:border-orange-300"
              />
              {errors.color && (
                <p className="text-xs text-red-500">{errors.color.message}</p>
              )}
            </div>

            {type === "create" && (
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs text-gray-500">Heslo*</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register("password")}
                    className="flex-1 rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                  />

                  <button
                    type="button"
                    onClick={generatePassword}
                    className="cursor-pointer rounded-lg bg-gray-100 px-3 py-2 font-medium text-gray-800 transition-all hover:bg-orange-100"
                  >
                    Generovat
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Nezapomeňte heslo a uživatelské jméno uložit a předat
                  uživateli.
                </p>
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
