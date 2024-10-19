import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { db, insertUser } from '@/lib/db'; // Asegúrate de importar la función insertUser

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
      // En el JWT almacenamos datos adicionales del perfil del usuario
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.name = user.name!;
        token.picture = user.image;

        // Almacenar usuario en bdd:
        await insertUser(token.email, token.name); // Llama a la función insertUser
      }
      
      console.log("JWT token info:", token);
      return token;
    },
  }
});
