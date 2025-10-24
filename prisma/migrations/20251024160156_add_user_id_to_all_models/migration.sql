-- AlterTable
ALTER TABLE "Click" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "EmailSignup" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Click_userId_idx" ON "Click"("userId");

-- CreateIndex
CREATE INDEX "EmailSignup_userId_idx" ON "EmailSignup"("userId");

-- CreateIndex
CREATE INDEX "Page_userId_idx" ON "Page"("userId");

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSignup" ADD CONSTRAINT "EmailSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
