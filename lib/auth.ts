import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import { prisma } from './prisma'
import { syncSubscriptionFromStripe } from './subscription'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        // Check if user account is soft-deleted
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { deletedAt: true },
        })

        if (dbUser?.deletedAt) {
          const daysSinceDeletion = Math.floor(
            (Date.now() - dbUser.deletedAt.getTime()) / (1000 * 60 * 60 * 24)
          )

          // If deleted less than 30 days ago, reactivate the account
          if (daysSinceDeletion < 30) {
            await prisma.user.update({
              where: { id: user.id },
              data: { deletedAt: null },
            })
            console.log(`Reactivated account for user ${user.id}`)
          } else {
            // Account was deleted more than 30 days ago
            // Block sign-in - user should contact support or we'll handle cleanup
            return '/auth/signin?error=AccountDeleted'
          }
        }

        // Sync subscription status from Stripe when user signs in
        await syncSubscriptionFromStripe(user.id)
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  session: {
    strategy: 'database',
  },
}
