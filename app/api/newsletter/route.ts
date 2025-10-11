import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

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

    // Try to create the email signup
    try {
      const signup = await prisma.emailSignup.create({
        data: { email: email.toLowerCase() },
      })

      return NextResponse.json({
        success: true,
        email: signup.email,
        createdAt: signup.createdAt,
      })
    } catch (error: unknown) {
      // Check if it's a unique constraint violation
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error saving email signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
