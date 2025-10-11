'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function NewsletterInterstitial() {
  const params = useParams()
  const shortCode = params.shortCode as string

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [linkId, setLinkId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the original URL and log the click
    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/redirect/${shortCode}`)
        const data = await res.json()

        if (res.ok) {
          setRedirectUrl(data.originalUrl)
          setLinkId(data.linkId)
        } else {
          setError(data.error || 'Link not found')
        }
      } catch {
        setError('Failed to load link')
      }
    }

    fetchLink()
  }, [shortCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, linkId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      // Redirect after successful signup
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl
    }
  }

  if (error && !redirectUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Before you go...
            </h1>
            <p className="text-gray-600">
              Join our newsletter for exclusive updates and content!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {error && redirectUrl && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !redirectUrl}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Subscribing...' : 'Subscribe & Continue'}
            </button>
          </form>

          <button
            onClick={handleSkip}
            disabled={!redirectUrl}
            className="w-full mt-3 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium transition disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Continue without signing up →
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
