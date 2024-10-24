import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { db, insertUser, userExists } from '@/lib/db'; 

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email', 
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      console.log("Session callback triggered");
      console.log("Token received:", token);
      session.user.id = token.sub!; // ID del usuario
      session.user.email = token.email!; // Correo
      session.user.image = token.picture; // Imagen de perfil

      console.log("Session info after setting token data:", session);
      return session;
    },
    async jwt({ token, account, user, profile }) {
      console.log("JWT callback triggered");
      console.log("Account info:", account);
      console.log("User info:", user);
      console.log("Profile info:", profile);

      if (account) {
        if (user) {
          token.id = user.id;
          token.email = user.email!;
          token.name = user.name!;
          token.picture = user.image;

          console.log("Checking if user exists in the database");
          const exists = await userExists(token.email);

          if (!exists) {
            console.log(`User does not exist. Inserting new user: ${token.email}`);
            await insertUser(token.email, token.name);
            token.isNewUser = true;
          } else {
            console.log(`User already exists: ${token.email}`);
            token.isNewUser = false;
          }
        } else if (account.provider === 'github' && profile) {
          // Manejo específico para GitHub
          console.log("Handling GitHub provider specific info");
          token.username = profile.login;
          token.email = profile.email;
        }
      }

      console.log("Final JWT token info:", token);
      return token;
    },
  },
  events: {
    signIn: async (message) => {
      console.log("Sign in event triggered:", message);
    },
    signOut: async (message) => {
      console.log("Sign out event triggered:", message);
    },

  }
});
