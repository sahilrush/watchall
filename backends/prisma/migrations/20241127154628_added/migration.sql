/*
  Warnings:

  - Added the required column `thumbnail_url` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "thumbnail_url" TEXT NOT NULL;
