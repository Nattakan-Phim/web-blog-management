import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminLogin } from "./api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { token, user } = await adminLogin(
            credentials.email as string,
            credentials.password as string
          );
          return { ...user, accessToken: token };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
