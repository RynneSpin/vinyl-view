-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "label" TEXT,
    "year" INTEGER,
    "discogsId" TEXT,
    "discogsUrl" TEXT,
    "upc" TEXT,
    "catno" TEXT,
    "format" TEXT,
    "formatDesc" TEXT,
    "speed" TEXT,
    "genres" TEXT[],
    "styles" TEXT[],
    "coverArtUrl" TEXT,
    "thumbnailUrl" TEXT,
    "country" TEXT,
    "released" TEXT,
    "notes" TEXT,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscogsCache" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscogsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Record_discogsId_key" ON "Record"("discogsId");

-- CreateIndex
CREATE INDEX "Record_artist_idx" ON "Record"("artist");

-- CreateIndex
CREATE INDEX "Record_title_idx" ON "Record"("title");

-- CreateIndex
CREATE INDEX "Record_discogsId_idx" ON "Record"("discogsId");

-- CreateIndex
CREATE INDEX "Record_upc_idx" ON "Record"("upc");

-- CreateIndex
CREATE INDEX "Record_dateAdded_idx" ON "Record"("dateAdded");

-- CreateIndex
CREATE INDEX "Record_userId_idx" ON "Record"("userId");

-- CreateIndex
CREATE INDEX "Record_userId_dateAdded_idx" ON "Record"("userId", "dateAdded");

-- CreateIndex
CREATE UNIQUE INDEX "DiscogsCache_query_key" ON "DiscogsCache"("query");

-- CreateIndex
CREATE INDEX "DiscogsCache_query_queryType_idx" ON "DiscogsCache"("query", "queryType");

-- CreateIndex
CREATE INDEX "DiscogsCache_expiresAt_idx" ON "DiscogsCache"("expiresAt");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
