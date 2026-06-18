-- CreateTable
CREATE TABLE "portfolios" (
    "id" SERIAL NOT NULL,
    "mua_profile_id" INTEGER NOT NULL,
    "photo_url" TEXT NOT NULL,
    "caption" TEXT,
    "style" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_mua_profile_id_fkey" FOREIGN KEY ("mua_profile_id") REFERENCES "mua_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

