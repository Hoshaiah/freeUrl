import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params

    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      )
    }

    // Find the link
    const link = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (!link || link.deletedAt) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Check if link is active
    if (!link.isActive) {
      return NextResponse.json(
        { error: 'This link has been deactivated' },
        { status: 410 } // 410 Gone
      )
    }

    // Log the click
    await prisma.click.create({
      data: {
        linkId: link.id,
        userId: link.userId,
      },
    })

    return NextResponse.json({
      originalUrl: link.originalUrl,
      linkId: link.id,
    })
  } catch (error) {
    console.error('Error fetching link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
