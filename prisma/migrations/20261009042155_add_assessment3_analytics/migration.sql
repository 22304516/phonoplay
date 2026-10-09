-- CreateTable
CREATE TABLE "GenerationEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'LIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "page" TEXT NOT NULL,
    "activityType" TEXT,
    "durationMs" INTEGER,
    "sessionId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'LIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "GenerationEvent_type_createdAt_idx" ON "GenerationEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationEvent_success_createdAt_idx" ON "GenerationEvent"("success", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_page_createdAt_idx" ON "UsageEvent"("page", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_activityType_createdAt_idx" ON "UsageEvent"("activityType", "createdAt");
