export const authOptions = {
  // Add authentication providers and configuration here
  // Example:
  // providers: [
  //   CredentialsProvider({
  //     name: 'credentials',
  //     async authorize(credentials, req) {
  //       // Add your authentication logic here
  //       return null
  //     }
  //   })
  // ],
  secret: process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
}
