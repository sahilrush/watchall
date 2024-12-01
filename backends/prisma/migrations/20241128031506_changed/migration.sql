/*
  Warnings:

  - You are about to drop the column `thumbnail_url` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_url` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "thumbnail_url",
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "thumbnail_url",
ADD COLUMN     "thumbnailUrl" TEXT;
