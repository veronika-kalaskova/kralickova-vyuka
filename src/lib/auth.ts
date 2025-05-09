import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/prihlaseni",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const existingUser = await db.user.findFirst({
          where: {
            username: credentials?.username,
          },
          include: {
            UserRole: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!existingUser || existingUser.deletedAt) {
          return null;
        }

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password,
        );

        if (!passwordMatch) {
          return null;
        }

        const roles = existingUser.UserRole.map((r) => r.role.name);

        return {
          id: `${existingUser.id}`,
          username: existingUser.username,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          roles: roles,
        };
      },
    }),
  ],
  callbacks: {
    // udaje z usera se ulozi do tokenu
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        };
      }

      return token;
    },
    // vrati se pokud frontend zavola session a prida do session hodnoty z tokenu
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          firstName: token.firstName,
          lastName: token.lastName,
          roles: token.roles,
        },
      };
    },
  },
};
