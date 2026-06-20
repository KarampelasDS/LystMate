ALTER TABLE "Invite" ADD COLUMN IF NOT EXISTS "inviteeEmail" TEXT;
UPDATE "Invite" SET "inviteeEmail" = (SELECT email FROM "User" WHERE "User".id = "Invite"."inviteeId") WHERE "inviteeEmail" IS NULL;
ALTER TABLE "Invite" ALTER COLUMN "inviteeEmail" SET NOT NULL;
ALTER TABLE "Invite" ALTER COLUMN "inviteeId" DROP NOT NULL;
ALTER TABLE "Invite" DROP CONSTRAINT IF EXISTS "Invite_listId_inviteeId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Invite_listId_inviteeEmail_key" ON "Invite"("listId", "inviteeEmail");
CREATE INDEX IF NOT EXISTS "Invite_inviteeEmail_idx" ON "Invite"("inviteeEmail");
CREATE INDEX IF NOT EXISTS "Invite_inviteeId_idx" ON "Invite"("inviteeId");
CREATE INDEX IF NOT EXISTS "Invite_inviterId_idx" ON "Invite"("inviterId");
