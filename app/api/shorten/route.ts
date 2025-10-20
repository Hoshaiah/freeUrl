import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkLinkLimit } from '@/lib/subscription'
import { PAGE_TEMPLATES } from '@/lib/pageTemplates'

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session to see if user is logged in
    const session = await getServerSession(authOptions)

    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check link limit for authenticated users
    if (session?.user?.id) {
      const canCreateLink = await checkLinkLimit(session.user.id)
      if (!canCreateLink) {
        return NextResponse.json(
          { error: 'Link limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    }

    // Generate unique short code
    let shortCode = generateShortCode(6)
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const existing = await prisma.link.findUnique({
        where: { shortCode },
      })

      if (!existing) break

      shortCode = generateShortCode(6)
      attempts++
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique short code' },
        { status: 500 }
      )
    }

    // Create the link (associate with user if logged in)
    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: url,
        userId: session?.user?.id || null,
      },
    })

    // Auto-create default page for the link
    const defaultTemplate = PAGE_TEMPLATES.find(t => t.id === 'default')
    if (defaultTemplate) {
      try {
        await prisma.page.create({
          data: {
            linkId: link.id,
            html: defaultTemplate.html,
            css: defaultTemplate.css,
          },
        })
        console.log('Default page auto-created for link:', link.id)
      } catch (error) {
        console.error('Failed to create default page:', error)
        // Don't fail the link creation if page creation fails
      }
    }

    return NextResponse.json({
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
    })
  } catch (error) {
    console.error('Error creating short link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
