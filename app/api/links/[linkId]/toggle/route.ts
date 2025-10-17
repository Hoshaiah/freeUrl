import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { linkId } = await params

    // Find the link and verify ownership
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Toggle the isActive status
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        isActive: !link.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      isActive: updatedLink.isActive,
    })
  } catch (error) {
    console.error('Error toggling link status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
