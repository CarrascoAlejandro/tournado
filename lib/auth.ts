import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { db, insertUser, userExists } from '@/lib/db'; // Asegúrate de importar las funciones insertUser y userExists

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Agregar más información del token al objeto de sesión
      session.user.id = token.sub!; // ID del usuario
      session.user.email = token.email!; // Correo
      session.user.image = token.picture; // Imagen de perfil
      
      console.log("Session info:", session);
      return session;
    },
    async jwt({ token, account, user, profile }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.name = user.name!;
        token.picture = user.image;
        token.isNewUser = false;

        const exists = await userExists(token.email);

        if (!exists) {
          await insertUser(token.email, token.name);
          token.isNewUser = true;

        } else {
          console.log("User already exists");
        }
      }
      
      console.log("JWT token info:", token);
      return token;
    },
  }
});
