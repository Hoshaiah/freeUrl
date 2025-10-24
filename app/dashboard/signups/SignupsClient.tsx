'use client'

import { useState } from 'react'
import Link from 'next/link'

type EmailSignupType = {
  id: string
  email: string
  linkId: string | null
  createdAt: Date
}

type Props = {
  emailSignups: EmailSignupType[]
  userPlan: 'free' | 'core' | 'pro'
}

export default function SignupsClient({ emailSignups, userPlan }: Props) {
  const [signupsPage, setSignupsPage] = useState(1)
  const [signupsPerPage, setSignupsPerPage] = useState(25)
  const [isDownloading, setIsDownloading] = useState(false)

  const isFreeUser = userPlan === 'free'
  const freeUserLimit = 10

  const handleDownloadCSV = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/signups/export')

      if (!response.ok) {
        throw new Error('Failed to download CSV')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email-signups-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Failed to download CSV')
    } finally {
      setIsDownloading(false)
    }
  }

  // Email signups pagination
  const totalSignupsPages = Math.ceil(emailSignups.length / signupsPerPage)
  const startSignupsIndex = (signupsPage - 1) * signupsPerPage
  const endSignupsIndex = startSignupsIndex + signupsPerPage
  const currentSignups = emailSignups.slice(startSignupsIndex, endSignupsIndex)

  return (
    <div className="space-y-4">
      {/* Upgrade Banner for Free Users */}
      {isFreeUser && emailSignups.length > freeUserLimit && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Upgrade to See All Email Signups</h3>
              <p className="text-indigo-100 mb-4">
                You have {emailSignups.length} email signups, but free accounts can only view {freeUserLimit}. Upgrade to Core or Pro to unlock all signups and download the full list.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
                >
                  View Plans
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <svg className="w-24 h-24 text-indigo-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">All Email Signups</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadCSV}
            disabled={isDownloading || emailSignups.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDownloading ? 'Downloading...' : 'Download CSV'}
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={signupsPerPage}
              onChange={(e) => {
                setSignupsPerPage(Number(e.target.value))
                setSignupsPage(1)
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {emailSignups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No email signups yet
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signed Up
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSignups.map((signup, index) => {
                  const globalIndex = startSignupsIndex + index
                  const isLocked = isFreeUser && globalIndex >= freeUserLimit

                  return (
                    <tr
                      key={signup.id}
                      className={`${isLocked ? 'opacity-40 bg-gray-50' : 'hover:bg-gray-50'} ${isLocked ? 'cursor-not-allowed' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className={`text-sm ${isLocked ? 'blur-sm select-none' : 'text-gray-900'}`}>
                          {isLocked ? 'example@email.com' : signup.email}
                        </div>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isLocked ? 'blur-sm select-none' : 'text-gray-500'}`}>
                          {isLocked ? (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">abcd1234...</code>
                          ) : signup.linkId ? (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {signup.linkId.substring(0, 8)}...
                            </code>
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isLocked ? 'blur-sm select-none' : 'text-gray-500'}`}>
                          {isLocked ? 'MM/DD/YYYY' : new Date(signup.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Email Signups Pagination */}
            {totalSignupsPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startSignupsIndex + 1} to {Math.min(endSignupsIndex, emailSignups.length)} of {emailSignups.length} signups
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSignupsPage(p => Math.max(1, p - 1))}
                    disabled={signupsPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalSignupsPages, 5) }, (_, i) => {
                      let page;
                      if (totalSignupsPages <= 5) {
                        page = i + 1;
                      } else if (signupsPage <= 3) {
                        page = i + 1;
                      } else if (signupsPage >= totalSignupsPages - 2) {
                        page = totalSignupsPages - 4 + i;
                      } else {
                        page = signupsPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setSignupsPage(page)}
                          className={`px-3 py-1 border rounded text-sm ${
                            page === signupsPage
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setSignupsPage(p => Math.min(totalSignupsPages, p + 1))}
                    disabled={signupsPage === totalSignupsPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  )
}
