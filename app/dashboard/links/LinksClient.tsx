'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeleteLinkModal from './DeleteLinkModal'

type LinkType = {
  id: string
  shortCode: string
  originalUrl: string
  createdAt: Date
  clicks: { id: string }[]
  _count: { emailSignups: number }
  isActive: boolean
  page: { id: string } | null
}

type Props = {
  links: LinkType[]
  showDeactivated: boolean
}

export default function LinksClient({ links, showDeactivated }: Props) {
  const router = useRouter()
  const [linksPage, setLinksPage] = useState(1)
  const [linksPerPage, setLinksPerPage] = useState(25)
  const [togglingLinks, setTogglingLinks] = useState<Set<string>>(new Set())
  const [deletingLinks, setDeletingLinks] = useState<Set<string>>(new Set())
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [linkToDelete, setLinkToDelete] = useState<{ id: string; shortCode: string } | null>(null)

  const handleToggleLink = async (linkId: string) => {
    setTogglingLinks(prev => new Set(prev).add(linkId))

    try {
      const res = await fetch(`/api/links/${linkId}/toggle`, {
        method: 'PATCH',
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to toggle link status')
      }
    } catch (error) {
      console.error('Error toggling link:', error)
      alert('An error occurred')
    } finally {
      setTogglingLinks(prev => {
        const next = new Set(prev)
        next.delete(linkId)
        return next
      })
    }
  }

  const handleDeleteLink = (linkId: string, shortCode: string) => {
    setLinkToDelete({ id: linkId, shortCode })
  }

  const confirmDeleteLink = async () => {
    if (!linkToDelete) return

    setDeletingLinks(prev => new Set(prev).add(linkToDelete.id))

    try {
      const res = await fetch(`/api/links/${linkToDelete.id}/delete`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setLinkToDelete(null)
        router.refresh()
      } else {
        alert('Failed to delete link')
      }
    } catch (error) {
      console.error('Error deleting link:', error)
      alert('An error occurred')
    } finally {
      setDeletingLinks(prev => {
        const next = new Set(prev)
        next.delete(linkToDelete.id)
        return next
      })
    }
  }

  const handleCopyShortCode = (linkId: string, shortCode: string) => {
    const baseUrl = window.location.origin
    const fullUrl = `${baseUrl}/${shortCode}`

    navigator.clipboard.writeText(fullUrl)
    setCopiedLinkId(linkId)

    // Hide notification after 2 seconds
    setTimeout(() => {
      setCopiedLinkId(null)
    }, 2000)
  }

  // Links pagination
  const totalLinksPages = Math.ceil(links.length / linksPerPage)
  const startLinksIndex = (linksPage - 1) * linksPerPage
  const endLinksIndex = startLinksIndex + linksPerPage
  const currentLinks = links.slice(startLinksIndex, endLinksIndex)

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {showDeactivated ? 'Deactivated Links' : 'Active Links'}
          </h2>
          <Link
            href={showDeactivated ? '/dashboard/links' : '/dashboard/links?deactivated=true'}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showDeactivated ? '← View Active Links' : 'View Deactivated Links →'}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={linksPerPage}
            onChange={(e) => {
              setLinksPerPage(Number(e.target.value))
              setLinksPage(1)
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
      <div className="overflow-x-auto">
        {links.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No links created yet. <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">Create your first link</Link>
          </div>
        ) : (
          <>
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
                    Signups
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 relative">
                        <code
                          onClick={() => handleCopyShortCode(link.id, link.shortCode)}
                          className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100 transition"
                          title="Click to copy full URL"
                        >
                          {link.shortCode}
                        </code>
                        {copiedLinkId === link.id && (
                          <span className="absolute left-full ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded shadow-lg whitespace-nowrap animate-fade-in">
                            Copied!
                          </span>
                        )}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {link._count.emailSignups} signups
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/pages/${link.id}/edit`}
                        className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                      >
                        {link.page ? 'Edit Page' : 'Create Page'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLink(link.id)}
                          disabled={togglingLinks.has(link.id)}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            showDeactivated
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 disabled:bg-green-50'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:bg-yellow-50'
                          } disabled:cursor-not-allowed`}
                        >
                          {togglingLinks.has(link.id)
                            ? '...'
                            : showDeactivated
                            ? 'Activate'
                            : 'Deactivate'}
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id, link.shortCode)}
                          disabled={deletingLinks.has(link.id)}
                          className="px-3 py-1 rounded text-sm font-medium transition bg-red-100 text-red-800 hover:bg-red-200 disabled:bg-red-50 disabled:cursor-not-allowed"
                          title="Delete link permanently"
                        >
                          {deletingLinks.has(link.id) ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Links Pagination */}
            {totalLinksPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startLinksIndex + 1} to {Math.min(endLinksIndex, links.length)} of {links.length} links
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLinksPage(p => Math.max(1, p - 1))}
                    disabled={linksPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalLinksPages, 5) }, (_, i) => {
                      let page;
                      if (totalLinksPages <= 5) {
                        page = i + 1;
                      } else if (linksPage <= 3) {
                        page = i + 1;
                      } else if (linksPage >= totalLinksPages - 2) {
                        page = totalLinksPages - 4 + i;
                      } else {
                        page = linksPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setLinksPage(page)}
                          className={`px-3 py-1 border rounded text-sm ${
                            page === linksPage
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
                    onClick={() => setLinksPage(p => Math.min(totalLinksPages, p + 1))}
                    disabled={linksPage === totalLinksPages}
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

      {/* Delete Link Modal */}
      {linkToDelete && (
        <DeleteLinkModal
          isOpen={true}
          onClose={() => setLinkToDelete(null)}
          onConfirm={confirmDeleteLink}
          loading={deletingLinks.has(linkToDelete.id)}
          shortCode={linkToDelete.shortCode}
        />
      )}
    </div>
  )
}
