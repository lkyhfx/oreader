-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "css" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    CONSTRAINT "Theme_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Theme" ("bookId", "css", "id") SELECT "bookId", "css", "id" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
