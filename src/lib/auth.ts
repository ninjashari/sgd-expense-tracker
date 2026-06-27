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
        console.log("[auth] authorize called");
        const username = credentials?.username as string;
        const password = credentials?.password as string;
        if (!username || !password) {
          console.log("[auth] missing username or password");
          return null;
        }

        console.log("[auth] looking up user:", username);
        const user = await getUserByUsername(username);
        if (!user) {
          console.log("[auth] user not found");
          return null;
        }
        console.log("[auth] user found, comparing password");

        const valid = await compare(password, user.password);
        console.log("[auth] password valid:", valid);
        if (!valid) return null;

        console.log("[auth] returning user:", user.id);
        return { id: user.id, name: user.username };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      console.log("[auth] jwt callback, has user:", !!user);
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      console.log("[auth] session callback, token.id:", token.id);
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
