/*
  Warnings:

  - You are about to drop the column `google_id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sub]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "google_id",
ADD COLUMN     "sub" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_sub_key" ON "User"("sub");
