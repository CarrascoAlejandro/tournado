import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    scope: string;
    accessToken?: string;
    user: {
      email?: string | undefined; // Acepta string o undefined
      username?: string | undefined; // Acepta string o undefined
    };
  }

  interface JWT {
    accessToken?: string;
    email?: string | undefined; // Acepta string o undefined
    username?: string | undefined; // Acepta string o undefined
  }
}
