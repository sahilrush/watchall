/*
  Warnings:

  - The values [ENTERTAINMENT,MUSIC,SPORTS,OTHER] on the enum `VideoCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `subscribersCount` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `currentTimestamp` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `VideoTimeUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoUrl` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `category` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoCategory_new" AS ENUM ('GAMING', 'EDUCATION', 'TECHNOLOGY');
ALTER TABLE "Video" ALTER COLUMN "category" TYPE "VideoCategory_new" USING ("category"::text::"VideoCategory_new");
ALTER TYPE "VideoCategory" RENAME TO "VideoCategory_old";
ALTER TYPE "VideoCategory_new" RENAME TO "VideoCategory";
DROP TYPE "VideoCategory_old";
COMMIT;

-- AlterEnum
ALTER TYPE "VideoStatus" ADD VALUE 'FAILED';

-- DropForeignKey
ALTER TABLE "VideoTimeUpdate" DROP CONSTRAINT "VideoTimeUpdate_userId_fkey";

-- DropForeignKey
ALTER TABLE "VideoTimeUpdate" DROP CONSTRAINT "VideoTimeUpdate_videoId_fkey";

-- DropForeignKey
ALTER TABLE "VideoUrl" DROP CONSTRAINT "VideoUrl_videoId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "subscribersCount",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "subscriber_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "currentTimestamp",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "viewCount",
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "videoUrls" JSONB,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'GAMING';

-- DropTable
DROP TABLE "VideoTimeUpdate";

-- DropTable
DROP TABLE "VideoUrl";

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_userId_videoId_key" ON "WatchHistory"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
