-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_linkId_key" ON "Page"("linkId");

-- CreateIndex
CREATE INDEX "Page_linkId_idx" ON "Page"("linkId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
