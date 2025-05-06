import { Course, Lesson, User } from "@prisma/client";

export type LessonWithCourseAndTeacher = Lesson & {
  course: Course & {
    teacher: User | null;
    student: User | null;
  };
} & {
  teacher: User;
};
