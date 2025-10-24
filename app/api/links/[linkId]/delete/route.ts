import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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

    if (!link || link.deletedAt) {
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

    // Soft delete the link by setting deletedAt
    const deletedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      deletedAt: deletedLink.deletedAt,
    })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
