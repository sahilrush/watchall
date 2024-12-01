-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "thumbnail_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "thumbnail_url" TEXT;
