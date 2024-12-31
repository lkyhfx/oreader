-- CreateTable
CREATE TABLE "DictLookup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hashId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DictLookup_hashId_key" ON "DictLookup"("hashId");
