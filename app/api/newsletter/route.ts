import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    // Get session to see if user is logged in
    const session = await getServerSession(authOptions)

    const { email, linkId } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create the email signup
    const signup = await prisma.emailSignup.create({
      data: {
        email: email.toLowerCase(),
        userId: session?.user?.id || null,
        linkId: linkId || null,
      },
    })

    return NextResponse.json({
      success: true,
      email: signup.email,
      createdAt: signup.createdAt,
    })
  } catch (error) {
    console.error('Error saving email signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
