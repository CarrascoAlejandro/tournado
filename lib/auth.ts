import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import { db, insertUser, userExists } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code',
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify email',
        },
      },
      profile(profile) {
        console.log('Discord profile response:', profile);
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.image_url,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      session.user.id = token.sub!;
      session.user.email = token.email!;
      session.user.image = token.picture!;
      return session;
    },
    async jwt({ token, account, user, profile }) {
      console.log('JWT callback:', { token, account, user, profile });
      if (account) {
        if (user) {
          token.id = user.id;
          token.email = user.email!;
          token.name = user.name!;
          token.picture = user.image;

          const exists = await userExists(token.email);
          if (!exists) {
            console.log('New user detected, inserting into DB:', token.email);
            await insertUser(token.email, token.name);
            token.isNewUser = true;
          } else {
            token.isNewUser = false;
          }
        } else if (account.provider === 'discord' && profile) {
          console.log('Discord profile in JWT callback:', profile);
          token.username = profile.username;
          token.email = profile.email;
        }
      }
      return token;
    },
  },
  events: {
    async signIn(message) {
      console.log('Sign in event:', message);
    },
    async signOut(message) {

      console.log('Sign out event:', message);
    }
  },
});
