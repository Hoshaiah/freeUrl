'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { PAGE_TEMPLATES } from '@/lib/pageTemplates'

export default function PageEditor() {
  const params = useParams()
  const router = useRouter()
  const linkId = params.linkId as string

  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [linkInfo, setLinkInfo] = useState<{ shortCode: string; originalUrl: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages/${linkId}`)

        if (res.ok) {
          const data = await res.json()
          setHtml(data.html)
          setCss(data.css)
          setLinkInfo({ shortCode: data.link.shortCode, originalUrl: data.link.originalUrl })
        } else if (res.status === 404) {
          // Page doesn't exist yet, set default template
          setHtml(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Page</title>
</head>
<body>
  <div class="container">
    <h1>Welcome!</h1>
    <p>This is your custom page. Edit the HTML and CSS to customize it.</p>
    <a href="#" class="btn">Click Here</a>
  </div>
</body>
</html>`)
          setCss(`body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 500px;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: background 0.3s;
}

.btn:hover {
  background: #764ba2;
}`)
        }
      } catch {
        setError('Failed to fetch page data')
      } finally {
        setFetching(false)
      }
    }

    fetchPage()
  }, [linkId])

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/pages/${linkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css }),
      })

      if (res.ok) {
        setSuccess('Page saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save page')
      }
    } catch {
      setError('Failed to save page')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/pages/${linkId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/dashboard/links')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete page')
      }
    } catch {
      setError('Failed to delete page')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = (templateId: string) => {
    const template = PAGE_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setHtml(template.html)
      setCss(template.css)
      setShowTemplates(false)
      setSuccess(`Template "${template.name}" loaded successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-gray-500">Loading...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => router.push('/dashboard/links')}
                className="text-indigo-600 hover:text-indigo-800 mb-4"
              >
                ← Back to Links
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Page Editor</h1>
              {linkInfo && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Short link: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{linkInfo.shortCode}</span></p>
                  <p>Redirects to: <span className="text-blue-600">{linkInfo.originalUrl}</span></p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <span>📄</span>
                <span>{showTemplates ? 'Hide Templates' : 'Choose Template'}</span>
              </button>

              {showTemplates && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PAGE_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer bg-white"
                      onClick={() => loadTemplate(template.id)}
                    >
                      <div className="text-4xl mb-3 text-center">{template.preview}</div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <p className="text-xs text-indigo-600 font-semibold">{template.category}</p>
                      <button className="mt-3 w-full bg-indigo-100 text-indigo-700 py-2 px-4 rounded font-medium hover:bg-indigo-200 transition">
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML
                </label>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Enter your HTML here..."
                  spellCheck={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSS
                </label>
                <textarea
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Enter your CSS here..."
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Saving...' : 'Save Page'}
              </button>

              <button
                onClick={() => {
                  setShowPreview(!showPreview)
                  setPreviewKey(prev => prev + 1)
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>

              {showPreview && (
                <button
                  onClick={() => setPreviewKey(prev => prev + 1)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  🔄 Refresh Preview
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition"
              >
                Delete Page
              </button>
            </div>

            {showPreview && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
                  <p className="text-sm text-gray-500">Make changes above and click &quot;Refresh Preview&quot; to update</p>
                </div>
                <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    key={previewKey}
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <style>${css}</style>
                      </head>
                      <body>
                        ${html}
                      </body>
                      </html>
                    `}
                    className="w-full h-[600px]"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
