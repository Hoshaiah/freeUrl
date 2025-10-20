import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pages/by-shortcode/[shortCode] - Fetch page by short code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    const link = await prisma.link.findUnique({
      where: { shortCode },
      include: {
        page: true,
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: "Link is inactive" },
        { status: 410 }
      );
    }

    if (!link.page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Log the click when custom page is accessed
    await prisma.click.create({
      data: {
        linkId: link.id,
      },
    });

    return NextResponse.json({
      html: link.page.html,
      css: link.page.css,
      originalUrl: link.originalUrl,
      linkId: link.id,
    });
  } catch (error) {
    console.error("Error fetching page by short code:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
