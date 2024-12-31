/*
  Warnings:

  - You are about to drop the column `filePath` on the `Book` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "coverBase64" TEXT,
    "title" TEXT,
    "author" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Book" ("author", "coverBase64", "createdAt", "fileName", "id", "title") SELECT "author", "coverBase64", "createdAt", "fileName", "id", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_fileName_key" ON "Book"("fileName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
