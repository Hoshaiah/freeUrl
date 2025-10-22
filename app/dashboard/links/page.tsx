import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import LinksClient from './LinksClient'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getLinks(userId: string, showDeactivated: boolean = false) {
  const links = await prisma.link.findMany({
    where: {
      userId,
      isActive: showDeactivated ? false : true,
    },
    include: {
      clicks: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          emailSignups: true,
        },
      },
      page: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return { links }
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ deactivated?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/links')
  }

  const params = await searchParams
  const showDeactivated = params.deactivated === 'true'

  const { links } = await getLinks(session.user.id, showDeactivated)

  return (
    <>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <div className="ml-64 flex-1 min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Links</h1>
              <p className="text-gray-600">View and manage all your shortened links</p>
            </div>

            <LinksClient links={links} showDeactivated={showDeactivated} />
          </div>
        </div>
      </div>
    </>
  )
}
