/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Pair` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Pair` table. All the data in the column will be lost.
  - The primary key for the `Wishlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `content` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Wishlist` table. All the data in the column will be lost.
  - Added the required column `giverName` to the `Pair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverName` to the `Pair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wishlist` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pair" (
    "giverId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "giverName" TEXT NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "receiverName" TEXT NOT NULL
);
INSERT INTO "new_Pair" ("giverId", "receiverId") SELECT "giverId", "receiverId" FROM "Pair";
DROP TABLE "Pair";
ALTER TABLE "new_Pair" RENAME TO "Pair";
CREATE TABLE "new_Wishlist" (
    "receiverId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wishlist" TEXT NOT NULL
);
DROP TABLE "Wishlist";
ALTER TABLE "new_Wishlist" RENAME TO "Wishlist";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
