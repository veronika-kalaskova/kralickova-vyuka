"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Attendance, Course, Lesson, User } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson & {
    course: Course & {
      teacher: User | null;
    };
  };
  students: User[];
  typeForm?: string;
  attendanceData?: Attendance[] | null;
}

export default function CreateUpdateAttendance({
  isOpen,
  onClose,
  lesson,
  students,
  typeForm,
  attendanceData,
}: Props) {
  const FormSchema = z.object({
    attendance: z.record(z.boolean()),
  });

  const { register, handleSubmit, reset } = useForm<z.infer<typeof FormSchema>>(
    {
      resolver: zodResolver(FormSchema),
    },
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && students.length) {
      const defaultValues: Record<number, boolean> = {};

      students.forEach((student) => {
        const existingAttendance = attendanceData?.find(
          (attendance) => attendance.userId === student.id,
        );

        defaultValues[student.id] =
          existingAttendance?.type === "present" ? true : false;
      });

      reset({ attendance: defaultValues });
    }
  }, [isOpen, students, reset, attendanceData]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      setError("");

      // values.attendance obsahuje {userId: hodnota checkboxu}

      const attendanceData = Object.entries(values.attendance).map(
        ([studentId, isPresent]) => ({
          lessonId: lesson.id,
          userId: parseInt(studentId),
          type: isPresent ? "present" : "absent",
          createdAt: new Date(),
        }),
      );

      const response = await fetch("/api/attendance", {
        method: typeForm === "update" ? "PUT" : "POST",
        body: JSON.stringify({ lessonId: lesson.id, attendanceData }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        setError(
          typeForm === "update"
            ? "Chyba při úpravě docházky."
            : "Chyba při vytváření docházky.",
        );
      }
    } catch (error) {
      console.error("Chyba při odesílání formuláře:", error);
      setError("Nastala neočekávaná chyba.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.49)]">
      <div className="max-h-screen w-full overflow-y-auto bg-white p-6 shadow-md sm:h-auto sm:max-w-xl md:rounded-md">
        <h2 className="title">
          {typeForm === "update" ? "Upravit docházku" : "Zaznamenat docházku"}

        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center border-b border-gray-100 py-2"
                >
                  <input
                    type="checkbox"
                    id={`student-${student.id}`}
                    {...register(`attendance.${student.id}`)}
                    className="h-5 w-5 rounded text-orange-500 focus:ring-orange-400"
                    defaultChecked={
                      attendanceData?.find(
                        (attendance) => attendance.userId === student.id,
                      )?.type === "present"
                    }
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="ml-3 flex-grow cursor-pointer text-sm"
                  >
                    {student.firstName} {student.lastName}
                  </label>
                </div>
              ))}
            </div>

            {error && (
              <div className="col-span-2 mt-2 text-xs text-red-500">
                {error}
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
                {isLoading
                  ? "Ukládám..."
                  : typeForm === "update"
                    ? "Uložit změny"
                    : "Uložit docházku"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
