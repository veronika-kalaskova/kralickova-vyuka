import { Course, Lesson, Attendance } from "@prisma/client";

export type CourseWithLessonsAttendances = Course & {
  Lesson: (Lesson & {
    Attendance: Attendance[];
  })[];
};
