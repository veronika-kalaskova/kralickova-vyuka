import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course, Group } from "@prisma/client";

const FormSchema = z.object({
  firstName: z.string().min(1, "Jméno je povinné"),
  lastName: z.string().min(1, "Příjmení je povinné"),
  username: z.string().min(1, "Uživatelské jméno je povinné"),
  password: z.string().min(1, "Heslo je povinné"),
  phone: z.string().min(1, "Telefon je povinný"),
  email: z.string().email("Neplatná e-mailová adresa"),
  courseType: z.enum(["individual", "pair", "group"]).optional(),
  courseIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  class: z.string(),
  pickup: z.boolean(),
});

interface Props {
  roleId: number;
  isOpen: boolean;
  onClose: () => void;
  courses: (Course & { group: Group | null })[];
}

export default function CreateStudentModal({
  roleId,
  isOpen,
  onClose,
  courses,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
      courseType: "individual",
      pickup: false,
    },
  });

  const [message, setMessage] = useState("");

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const courseType = watch("courseType");

  const [filteredGroups, setFilteredGroups] = useState<(Group & { Course: Course[] })[]>([])

  useEffect(() => {
    if (firstName && lastName) {
      const suggestedUsername = `${firstName.toLowerCase()}.${lastName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")}`;
      setValue("username", suggestedUsername);
    }
  }, [firstName, lastName, setValue]);

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

  // const filterGroupsByCourse = (courseId: number) => {
  //   console.log(groups.map((group) => group.Course));
  //   return groups.filter((group) =>
  //     group.Course.some((course) => course.id === courseId)
  //   );
  // };
  
  

  // const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedCourseId = Number(event.target.value);
  //   setFilteredGroups(filterGroupsByCourse(selectedCourseId));
  // };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const courseIds = values.courseIds?.map((id) => parseInt(id, 10));

    const response = await fetch("/api/student", {
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

  const CourseSelector = ({
    filter,
    message,
  }: {
    filter: (course: any) => boolean;
    message?: string;
  }) => (
    <div   className={`grid w-full gap-4 ${
      filteredGroups.length > 0 ? "col-span-2 md:col-span-2" : "col-span-2 md:col-span-3"
    }`}>
      <label className="text-xs text-gray-500">Vyberte kurz(y)</label>
      <p className="text-[10px] text-gray-500">{message}</p>
      <select
        multiple
        {...register("courseIds")}
        className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
        
      >
        {courses.filter(filter).map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#0000007e]">
      <div className="h-full w-full overflow-auto bg-white p-6 shadow-md md:h-auto md:max-h-screen md:max-w-2xl md:rounded-md">
        <h2 className="title">Vytvořit studenta</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
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

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Třída</label>
              <input
                {...register("class")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              />
              {errors.class && (
                <p className="text-xs text-red-500">{errors.class.message}</p>
              )}
            </div>

            {/* TODO: hezci design */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                {...register("pickup")}
                className="h-5 w-5 rounded border-gray-300 text-orange-400 focus:ring-orange-300"
              />
              <label className="text-sm text-gray-700">
                Vyzvedávání z družiny
              </label>
              {errors.pickup && (
                <p className="text-xs text-red-500">{errors.pickup.message}</p>
              )}
            </div>

            <div className="col-span-2 mb-4 flex flex-col gap-2 md:col-span-3">
              <label className="text-xs text-gray-500">Typ kurzu</label>
              <select
              
                {...register("courseType")}
                className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
              >
                <option value="individual">Individuální</option>
                <option value="pair">Dvojice</option>
                <option value="group">Skupinový</option>
              </select>
              {errors.courseType && (
                <p className="text-xs text-red-500">
                  {errors.courseType.message}
                </p>
              )}
            </div>


            {courseType === "group" && (
              <CourseSelector
                filter={(course) => !course.isIndividual && !course.isPair}
              />
            )}
            {courseType === "individual" && (
              <CourseSelector
                filter={(course) => course.isIndividual && !course.isPair}
                message="Jedná se o kurzy, které již nemají přiřazeného studenta"
              />
            )}
            {courseType === "pair" && (
              <CourseSelector
                filter={(course) => !course.isIndividual && course.isPair}
              />
            )}

            {/* {filteredGroups && filteredGroups.length > 0 && (
              <div className="col-span-2 mb-4 flex w-full flex-col gap-2 md:col-span-1">
                <label className="text-xs text-gray-500">Vyberte skupinu</label>
                <p className="text-[10px] text-gray-500"></p>
                <select
                  multiple
                  {...register("groupIds")}
                  className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
                >
                  {filteredGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )} */}

            <div className="col-span-2 mb-4 flex flex-col gap-2 md:col-span-1">
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
                Nezapomeňte heslo a uživatelské jméno uložit a předat uživateli.
              </p>
            </div>

            {message && (
              <div className="col-span-2 mt-2 text-xs text-red-500 md:col-span-4">
                {message}
              </div>
            )}

            <div className="col-span-2 flex justify-end gap-2 md:col-span-3">
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
                Vytvořit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
