import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      authorization: {
        params: {
          scopes: 'read:user, user:email', // Scopes adicionales
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Acceder al correo electrónico y nombre de usuario desde el perfil
        console.log("Usuario GitHub:", profile.login); // Nombre de usuario
        console.log("Correo electrónico:", profile.email); // Email

        // Guardar el correo electrónico y el nombre de usuario en el token
        token.username = profile.login;
        token.email = profile.email;
      }
      return token;
    },
    /* async session({ session, token }) {
      console.log("Session Token Object:", token); // Ver el token en la sesión
      session.accessToken = token.accessToken; // Pasar el accessToken a la sesión
      return session;
    }, */
  },
});

