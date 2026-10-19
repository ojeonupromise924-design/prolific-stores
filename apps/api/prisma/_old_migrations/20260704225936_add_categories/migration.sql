-- DropIndex
DROP INDEX "public"."Category_name_key";

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
