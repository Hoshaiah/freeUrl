import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pages/[linkId] - Fetch page for a link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;

    const page = await prisma.page.findUnique({
      where: { linkId },
      include: {
        link: {
          select: {
            shortCode: true,
            originalUrl: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// POST /api/pages/[linkId] - Create or update page for a link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { linkId } = await params;
    const { html, css } = await request.json();

    if (!html || !css) {
      return NextResponse.json(
        { error: "HTML and CSS are required" },
        { status: 400 }
      );
    }

    // Verify link exists and belongs to user
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this link" },
        { status: 403 }
      );
    }

    // Create or update page
    const page = await prisma.page.upsert({
      where: { linkId },
      create: {
        linkId,
        html,
        css,
      },
      update: {
        html,
        css,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error creating/updating page:", error);
    return NextResponse.json(
      { error: "Failed to create/update page" },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[linkId] - Delete page for a link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { linkId } = await params;

    // Verify link exists and belongs to user
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this link" },
        { status: 403 }
      );
    }

    // Delete page
    await prisma.page.delete({
      where: { linkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
