/*
  Warnings:

  - Added the required column `mesh_id` to the `device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."device" ADD COLUMN     "mesh_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."device" ADD CONSTRAINT "device_mesh_id_fkey" FOREIGN KEY ("mesh_id") REFERENCES "public"."mesh"("id") ON DELETE CASCADE ON UPDATE CASCADE;
