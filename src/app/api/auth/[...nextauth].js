import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    // Credentials Provider for Email/Password Sign-in
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const isSignUp = req.body?.isSignUp === 'true';

        const endpoint = isSignUp ? 'register' : 'login';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${endpoint}`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            name: credentials.name, // only used in signup
          }),
        });

        const user = await res.json();
        if (res.ok && user) return user;
        return null;
      }
    }),

    // Google Sign-In/Sign-Up
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On first sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      // Handle Google Sign-In/Up
      if (account?.provider === 'google' && profile?.email) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name,
          }),
        });

        const dbUser = await res.json();
        if (res.ok) {
          token.id = dbUser.id;
          token.name = dbUser.name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },

  pages: {
    signIn: '/auth/signin',
  },
});
