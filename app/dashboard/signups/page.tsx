import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import SignupsClient from './SignupsClient'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getEmailSignups(userId: string) {
  const emailSignups = await prisma.emailSignup.findMany({
    where: {
      link: {
        userId: userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return { emailSignups }
}

export default async function SignupsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/signups')
  }

  const { emailSignups } = await getEmailSignups(session.user.id)

  return (
    <>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <div className="ml-64 flex-1 min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Signups</h1>
              <p className="text-gray-600">View all email addresses captured through your links</p>
            </div>

            <SignupsClient emailSignups={emailSignups} />
          </div>
        </div>
      </div>
    </>
  )
}
