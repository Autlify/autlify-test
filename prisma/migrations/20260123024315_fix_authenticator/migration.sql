/*
  Warnings:

  - The primary key for the `Authenticator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Authenticator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID");
