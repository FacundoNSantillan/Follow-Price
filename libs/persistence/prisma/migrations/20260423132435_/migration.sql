/*
  Warnings:

  - You are about to drop the column `currency` on the `PriceLog` table. All the data in the column will be lost.
  - You are about to drop the column `storeName` on the `PriceLog` table. All the data in the column will be lost.
  - You are about to drop the column `storeUrl` on the `PriceLog` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `PriceLog` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `PriceLog` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.
  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `store` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PriceLog" DROP CONSTRAINT "PriceLog_productId_fkey";

-- DropIndex
DROP INDEX "PriceLog_timestamp_idx";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "PriceLog" DROP COLUMN "currency",
DROP COLUMN "storeName",
DROP COLUMN "storeUrl",
DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brand",
DROP COLUMN "category",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "store" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_url_key" ON "Product"("url");

-- AddForeignKey
ALTER TABLE "PriceLog" ADD CONSTRAINT "PriceLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
