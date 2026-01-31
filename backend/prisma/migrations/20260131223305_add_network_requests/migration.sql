-- CreateTable
CREATE TABLE "NetworkRequest" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" INTEGER,
    "statusText" TEXT,
    "resourceType" TEXT NOT NULL,
    "duration" INTEGER,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "failed" BOOLEAN NOT NULL DEFAULT false,
    "errorText" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testRunId" TEXT NOT NULL,

    CONSTRAINT "NetworkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NetworkRequest_testRunId_idx" ON "NetworkRequest"("testRunId");

-- AddForeignKey
ALTER TABLE "NetworkRequest" ADD CONSTRAINT "NetworkRequest_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
