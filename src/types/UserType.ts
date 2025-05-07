import { User, Course, Group, StudentGroup } from "@prisma/client";

export type UserWithCoursesAndGroups = User & {
  CoursesTaken: (Course & {
    group: Group | null;
    teacher: User | null;
  })[];
  StudentGroup: (StudentGroup & {
    group: Group & {
      Course: (Course & { teacher: User | null })[];
    };
  })[];
};
