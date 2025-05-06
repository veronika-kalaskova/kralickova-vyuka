import NextAuth from "next-auth";
declare module "next-auth" {
  // pridani typu pro uzivatele a session
  interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }
  interface Session {
    user: User;
  }
}
  
