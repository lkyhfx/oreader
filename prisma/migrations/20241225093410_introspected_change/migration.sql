-- CreateTable
CREATE TABLE "book_embeddings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT,
    "metadata" TEXT,
    "embedding" f32_blob(1024)
);
