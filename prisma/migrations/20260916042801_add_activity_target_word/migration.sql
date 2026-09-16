-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "hint" BOOLEAN NOT NULL DEFAULT true,
    "wordListId" INTEGER NOT NULL,
    "wordId" INTEGER,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("createdAt", "difficulty", "hint", "id", "name", "settings", "type", "updatedAt", "wordListId") SELECT "createdAt", "difficulty", "hint", "id", "name", "settings", "type", "updatedAt", "wordListId" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
