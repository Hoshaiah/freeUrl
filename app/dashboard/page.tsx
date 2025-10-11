import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

async function getAnalytics(userId: string) {
  const links = await prisma.link.findMany({
    where: { userId },
    include: {
      clicks: {
        orderBy: {
          timestamp: 'desc',
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

  return {
    links,
    totalClicks,
    totalLinks,
    totalSignups,
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const { links, totalClicks, totalLinks, totalSignups } = await getAnalytics(session.user.id)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your shortened links performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Links</div>
            <div className="text-3xl font-bold text-indigo-600">{totalLinks}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-green-600">{totalClicks}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Email Signups</div>
            <div className="text-3xl font-bold text-purple-600">{totalSignups}</div>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Links</h2>
          </div>
          <div className="overflow-x-auto">
            {links.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No links created yet. <Link href="/" className="text-indigo-600 hover:text-indigo-700">Create your first link</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <code className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {link.shortCode}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-md" title={link.originalUrl}>
                          {link.originalUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {link.clicks.length} clicks
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

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
