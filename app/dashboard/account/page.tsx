import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import AccountClient from './AccountClient'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      _count: {
        select: {
          links: true,
        }
      }
    },
  })

  return user
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/account')
  }

  const userData = await getUserData(session.user.id)

  return (
    <>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <div className="ml-64 flex-1 min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-gray-600">Manage your account information and subscription</p>
            </div>

            <AccountClient user={userData} />
          </div>
        </div>
      </div>
    </>
  )
}
