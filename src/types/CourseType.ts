import { Course, Lesson, Attendance, User } from "@prisma/client";

export type CourseWithLessonsAttendances = Course & {
  Lesson: (Lesson & {
    Attendance: Attendance[];
  })[];
};

export type CourseWithLesson = Course & {
  Lesson: (Lesson & {
    teacher: User
  })[];
};

