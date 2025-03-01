// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

// Define proper types for the auth and request parameters
type AuthParam = {
  user?: {
    id: string;
    role: string;
  } | null;
};

type RequestParam = {
  nextUrl: {
    pathname: string;
  };
};

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }: { auth: AuthParam; request: RequestParam }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        const isAdmin = auth?.user?.role === "ADMIN";
        return isAdmin;
      }

      return true;
    },
  },
  providers: [], // This is needed for the authConfig object
};
