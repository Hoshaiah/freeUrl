'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'

export default function HomeClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // If user is not signed in, redirect to sign in page
    if (!session) {
      router.push('/auth/signin?callbackUrl=/')
      return
    }

    setError('')
    setShortUrl('')
    setLoading(true)


    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL')
      }

      const baseUrl = window.location.origin
      setShortUrl(`${baseUrl}/${data.shortCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
  }

  // Show loading screen while checking session
  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn Your Followers Into
              <span className="text-indigo-600"> Leads</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Build your email list on autopilot. Shorten any link, and your followers see an email signup before accessing your free content. Turn clicks into subscribers easy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-lg"
              >
                Try For Free
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition text-lg border-2 border-indigo-600"
              >
                See How It Works
              </button>
            </div>
          </div>

          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grow Your Newsletter</h3>
              <p className="text-gray-600">
                Every shortened link shows an email capture page first. Turn clicks into subscribers effortlessly.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Every Click</h3>
              <p className="text-gray-600">
                Real-time analytics on clicks, conversions, location, and engagement-time. See what&apos;s working and double down on it.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">5 Minute Setup</h3>
              <p className="text-gray-600">
                No complex integrations. Start capturing emails from your Instagram, TikTok, or Twitter bio link today.
              </p>
            </div>
          </div>

          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-gradient-to-br from-indigo-50 to-blue-50 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-600">Three simple steps to start growing your email list</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector Lines */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200"></div>

              <div className="text-center relative">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 relative z-10 border-4 border-white shadow">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Link</h3>
                <p className="text-gray-600">
                  Paste any URL you want to share—blog posts, products, videos, anything.
                </p>
              </div>

              <div className="text-center relative">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 relative z-10 border-4 border-white shadow">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Share Everywhere</h3>
                <p className="text-gray-600">
                  Put your link in your bio, posts, stories—anywhere your audience hangs out.
                </p>
              </div>

              <div className="text-center relative">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <svg className="w-8 h-8 text-indigo-600 absolute top-8 right-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 relative z-10 border-4 border-white shadow">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Collect Emails</h3>
                <p className="text-gray-600">
                  Every click shows your signup page first. Watch your email list grow automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Demo Section */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">What Your Followers See</h2>
              <p className="text-gray-600">Every click shows a beautiful email capture page before the redirect</p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto border-4 border-indigo-100">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-block bg-gray-100 px-4 py-1 rounded text-xs text-gray-500">freeurl.com/abc123</div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Before you go...</h3>
                <p className="text-gray-600 text-sm">Join our newsletter for exclusive content and updates</p>

                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-left">
                    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium">
                    Subscribe & Continue
                  </div>
                  <button className="text-sm text-gray-400 hover:text-gray-600">
                    Skip for now →
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">Fully customizable design • Mobile responsive • Lightning fast</p>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Try It Yourself</h2>
              <p className="text-gray-600">Create your first link and see the magic happen</p>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Paste any link you want to share
                  </label>
                  <input
                    type={!session ? 'text' : 'url'}
                    id="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://your-content.com/blog/amazing-post"
                    required={!session ? false : true}
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Creating Your Lead Magnet...' : 'Create Lead-Capturing Link'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {shortUrl && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Your lead-capturing link is ready:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shortUrl}
                      readOnly
                      className="flex-1 px-3 py-2 text-black bg-white border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Anyone who clicks this will see your email signup page before being redirected!
                  </p>
                </div>
              )}
            </div>

            {session && (
              <div className="mt-8 text-center">
                <Link
                  href="/dashboard"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  View Analytics Dashboard →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Social Proof / Use Cases */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Perfect For Creators Who Share Links On</h3>
            <div className="flex flex-wrap justify-center gap-6 text-gray-600">
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow">
                <span className="font-semibold">Instagram Bio</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow">
                <span className="font-semibold">TikTok Profile</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow">
                <span className="font-semibold">Twitter/X Posts</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow">
                <span className="font-semibold">YouTube Descriptions</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow">
                <span className="font-semibold">LinkedIn</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
