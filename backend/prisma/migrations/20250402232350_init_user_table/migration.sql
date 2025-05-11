-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "google_auth_sub" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_google_auth_sub_key" ON "User"("google_auth_sub");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "User"
ADD CONSTRAINT "User_auth_check"
CHECK (
  google_auth_sub IS NOT NULL OR password IS NOT NULL
);