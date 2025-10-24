import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all email signups for the user's links
    const emailSignups = await prisma.emailSignup.findMany({
      where: {
        link: {
          userId: session.user.id,
        },
      },
      select: {
        email: true,
        createdAt: true,
        link: {
          select: {
            shortCode: true,
            originalUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Generate CSV content
    const headers = ['Email', 'Short Code', 'Original URL', 'Signed Up Date']
    const csvRows = [headers.join(',')]

    emailSignups.forEach((signup) => {
      const row = [
        signup.email,
        signup.link?.shortCode || 'N/A',
        `"${signup.link?.originalUrl || 'N/A'}"`, // Wrap URL in quotes in case it contains commas
        new Date(signup.createdAt).toLocaleString(),
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="email-signups-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting email signups:', error)
    return NextResponse.json(
      { error: 'Failed to export email signups' },
      { status: 500 }
    )
  }
}
