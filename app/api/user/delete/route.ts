import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete the user account
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Invalidate all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Your account has been scheduled for deletion. You have 30 days to reactivate it by logging in again. After 30 days, your data will be permanently deleted.',
    })
  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
