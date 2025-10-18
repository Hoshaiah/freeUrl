import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DashboardClient from './DashboardClient'
import { getUserPlan, PLAN_LIMITS } from '@/lib/subscription'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

async function getAnalytics(userId: string, showDeactivated: boolean = false) {
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const totalClicks = await prisma.click.count({
    where: {
      link: { userId },
    },
  })

  const totalLinks = links.length
  const totalSignups = await prisma.emailSignup.count()

  // Get all email signups (pagination handled client-side)
  const emailSignups = await prisma.emailSignup.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    links,
    totalClicks,
    totalLinks,
    totalSignups,
    emailSignups,
  }
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ deactivated?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const params = await searchParams
  const showDeactivated = params.deactivated === 'true'

  const { links, totalClicks, totalLinks, totalSignups, emailSignups } = await getAnalytics(
    session.user.id,
    showDeactivated
  )

  // Get user's plan
  const userPlan = await getUserPlan(session.user.id)
  const planLimits = PLAN_LIMITS[userPlan]

  console.log('[Dashboard] User ID:', session.user.id)
  console.log('[Dashboard] User plan:', userPlan)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Track your shortened links performance</p>
              </div>
              <div className="bg-white rounded-lg shadow px-6 py-4">
                <div className="text-sm text-gray-600 mb-1">Current Plan</div>
                <div className="text-2xl font-bold text-indigo-600 capitalize">{userPlan}</div>
                {userPlan === 'free' && (
                  <Link
                    href="/pricing"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Upgrade →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Links</div>
              <div className="text-3xl font-bold text-indigo-600">
                {totalLinks}
                <span className="text-lg text-gray-500 ml-2">
                  / {planLimits.links === Infinity ? '∞' : planLimits.links}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Clicks</div>
              <div className="text-3xl font-bold text-green-600">{totalClicks}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Email Signups</div>
              <div className="text-3xl font-bold text-purple-600">
                {totalSignups}
                <span className="text-lg text-gray-500 ml-2">
                  / {planLimits.emailSignups === Infinity ? '∞' : planLimits.emailSignups}
                </span>
              </div>
            </div>
          </div>

          {/* Client Component with Pagination */}
          <DashboardClient
            links={links}
            emailSignups={emailSignups}
            showDeactivated={showDeactivated}
          />

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
