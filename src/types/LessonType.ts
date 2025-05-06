import { Course, Lesson, User } from "@prisma/client";

export type LessonWithCourseTeacherStudentAndTeacher = Lesson & {
  course: Course & {
    teacher: User | null;
    student: User | null;
  };
} & {
  teacher: User;
};

export type LessonWithCourseAndTeacher = Lesson & { course: Course } & {
  teacher: User;
};
