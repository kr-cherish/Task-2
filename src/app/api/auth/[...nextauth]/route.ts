import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/model/User"; 
import connect from "@/app/utils/dbConnection";
import { jwt } from "next-auth/jwt";

interface CustomUser {
  id: string;
  email: string;
  name: string;
  mobileNumber?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connect();

        try {
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.fname} ${user.lname}`,
            mobileNumber: user.mobileNumber ?? null,
          } as CustomUser;
        } catch (error) {
          console.error("Authorize Error:", error);
          throw new Error("Something went wrong");
        }
      },
    })
  ],

  callbacks: {
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          mobileNumber: token.mobileNumber ?? null, 
        } as CustomUser;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.mobileNumber = user.mobileNumber;
      }
      return token;
    },
  },

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
