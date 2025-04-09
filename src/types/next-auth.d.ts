import NextAuth from "next-auth";
declare module "next-auth" {
  interface User {
    username: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }
  interface Session {
    user: User & { username: string; firstName: string; lastName: string, roles: string[] };
    token: {
      username: string;
      firstName: string;
      lastName: string;
      roles: string[];
    };
  }
}
