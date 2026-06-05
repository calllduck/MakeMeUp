-- CreateTable
CREATE TABLE "service_packages" (
    "id" SERIAL NOT NULL,
    "muaProfileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "includedServices" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_addons" (
    "id" SERIAL NOT NULL,
    "muaProfileId" INTEGER NOT NULL,
    "servicePackageId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "package_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mua_schedules" (
    "id" SERIAL NOT NULL,
    "muaProfileId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mua_schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_muaProfileId_fkey" FOREIGN KEY ("muaProfileId") REFERENCES "mua_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_addons" ADD CONSTRAINT "package_addons_muaProfileId_fkey" FOREIGN KEY ("muaProfileId") REFERENCES "mua_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_addons" ADD CONSTRAINT "package_addons_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mua_schedules" ADD CONSTRAINT "mua_schedules_muaProfileId_fkey" FOREIGN KEY ("muaProfileId") REFERENCES "mua_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
