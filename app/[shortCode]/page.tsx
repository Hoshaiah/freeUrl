'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function NewsletterInterstitial() {
  const params = useParams()
  const shortCode = params.shortCode as string

  const [error, setError] = useState('')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [linkId, setLinkId] = useState<string | null>(null)
  const [customPage, setCustomPage] = useState<{ html: string; css: string } | null>(null)
  const [hasCustomPage, setHasCustomPage] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if there's a custom page for this link
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages/by-shortcode/${shortCode}`)

        if (res.ok) {
          const data = await res.json()
          setCustomPage({ html: data.html, css: data.css })
          setRedirectUrl(data.originalUrl)
          setLinkId(data.linkId)
          setHasCustomPage(true)
          return
        }
      } catch {
        // If custom page fetch fails, fall back to default behavior
      }

      // No custom page found, fetch link info for newsletter form
      setHasCustomPage(false)
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

    fetchPage()
  }, [shortCode])

  // Inject data into window before rendering custom page
  useEffect(() => {
    if (hasCustomPage && linkId && redirectUrl) {
      interface WindowWithLinkData extends Window {
        __LINK_DATA__?: {
          linkId: string | null
          originalUrl: string | null
          shortCode: string
        }
      }
      (window as WindowWithLinkData).__LINK_DATA__ = {
        linkId,
        originalUrl: redirectUrl,
        shortCode
      };
      console.log('Link data injected via useEffect:', (window as WindowWithLinkData).__LINK_DATA__);
    }
  }, [hasCustomPage, linkId, redirectUrl, shortCode]);

  // Execute scripts after custom page renders
  useEffect(() => {
    if (hasCustomPage && customPage) {
      // Find and execute all script tags in the custom HTML
      const container = document.querySelector('#custom-page-container');
      if (container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
      }
    }
  }, [hasCustomPage, customPage]);

  // Render custom page if available
  if (hasCustomPage && customPage) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: customPage.css }} />
        <div id="custom-page-container" dangerouslySetInnerHTML={{ __html: customPage.html }} />
      </>
    )
  }

  // If there's an error or no custom page found, show error
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'This link does not exist or has been deactivated.'}</p>
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
