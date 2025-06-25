/*
  Warnings:

  - Added the required column `effective_stock` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "effective_stock" INTEGER NOT NULL,
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "stock-Hold" INTEGER,
ADD COLUMN     "stock-IN" INTEGER,
ADD COLUMN     "stock-Out" INTEGER;
