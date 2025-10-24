import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, linkId } = body

    console.log('Newsletter API called with:', { email, linkId })

    if (!email || typeof email !== 'string') {
      console.error('Invalid email:', email)
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      console.error('Invalid email format:', email)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get userId from link if linkId is provided
    let userId = null
    if (linkId) {
      const link = await prisma.link.findUnique({
        where: { id: linkId },
        select: { userId: true },
      })
      userId = link?.userId || null
    }

    // Create the email signup
    const signup = await prisma.emailSignup.create({
      data: {
        email: email.toLowerCase(),
        linkId: linkId || null,
        userId: userId,
      },
    })

    console.log('Email signup created successfully:', signup.id)

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
