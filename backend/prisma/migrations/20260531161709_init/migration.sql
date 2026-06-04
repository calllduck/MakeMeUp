-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'mua', 'admin');

-- CreateEnum
CREATE TYPE "SkinType" AS ENUM ('normal', 'oily', 'dry', 'combination', 'sensitive');

-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('flat', 'per_km', 'free');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "defaultLocation" TEXT,
    "skinType" "SkinType",
    "skinTone" TEXT,
    "skinConditions" JSONB,
    "sensitiveIngredients" JSONB,
    "preferredStyles" JSONB,
    "preferredEvents" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mua_profiles" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "operationalLocation" TEXT NOT NULL,
    "yearsExperience" INTEGER,
    "specializations" JSONB NOT NULL,
    "makeupStyles" JSONB NOT NULL,
    "canUseOwnSkinprep" BOOLEAN NOT NULL DEFAULT true,
    "canUseClientSkinprep" BOOLEAN NOT NULL DEFAULT true,
    "ownSkinprepIngredients" JSONB,
    "transportType" "TransportType" NOT NULL DEFAULT 'per_km',
    "transportFlatFee" DECIMAL(65,30),
    "transportPerKmRate" DECIMAL(65,30),
    "ratingAvg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "mua_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_userId_key" ON "client_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mua_profiles_userId_key" ON "mua_profiles"("userId");

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mua_profiles" ADD CONSTRAINT "mua_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
