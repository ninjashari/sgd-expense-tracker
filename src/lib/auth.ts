import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getUserByUsername } from "./db/queries";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;
        if (!username || !password) return null;

        const user = await getUserByUsername(username);
        if (!user) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.username };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
