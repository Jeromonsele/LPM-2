-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "sourceId" TEXT,
    "sopId" TEXT,
    "orgId" TEXT,
    CONSTRAINT "Job_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "Sop" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("createdAt", "id", "message", "progress", "sopId", "sourceId", "status", "type", "updatedAt") SELECT "createdAt", "id", "message", "progress", "sopId", "sourceId", "status", "type", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE TABLE "new_Sop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "contentMd" TEXT NOT NULL,
    "audience" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "orgId" TEXT,
    "sourceId" TEXT,
    CONSTRAINT "Sop_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sop_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sop" ("audience", "contentMd", "createdAt", "id", "sourceId", "status", "title", "updatedAt") SELECT "audience", "contentMd", "createdAt", "id", "sourceId", "status", "title", "updatedAt" FROM "Sop";
DROP TABLE "Sop";
ALTER TABLE "new_Sop" RENAME TO "Sop";
CREATE TABLE "new_Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "filePath" TEXT,
    "transcriptText" TEXT,
    "notes" TEXT,
    "orgId" TEXT,
    CONSTRAINT "Source_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Source" ("createdAt", "filePath", "id", "kind", "mimeType", "notes", "originalName", "sizeBytes", "transcriptText") SELECT "createdAt", "filePath", "id", "kind", "mimeType", "notes", "originalName", "sizeBytes", "transcriptText" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
