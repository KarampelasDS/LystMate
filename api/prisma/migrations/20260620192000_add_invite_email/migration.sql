-- Add inviteeEmail column with a temporary default so existing rows are handled
ALTER TABLE "Invite" ADD COLUMN "inviteeEmail" TEXT NOT NULL DEFAULT '';

-- Backfill from the related User record
UPDATE "Invite" SET "inviteeEmail" = (
  SELECT email FROM "User" WHERE "User".id = "Invite"."inviteeId"
);

-- Remove the temporary default
ALTER TABLE "Invite" ALTER COLUMN "inviteeEmail" DROP DEFAULT;

-- Make inviteeId nullable
ALTER TABLE "Invite" ALTER COLUMN "inviteeId" DROP NOT NULL;

-- Drop old unique constraint (listId + inviteeId) and replace with (listId + inviteeEmail)
ALTER TABLE "Invite" DROP CONSTRAINT IF EXISTS "Invite_listId_inviteeId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Invite_listId_inviteeEmail_key" ON "Invite"("listId", "inviteeEmail");

-- Add indexes
CREATE INDEX IF NOT EXISTS "Invite_inviteeEmail_idx" ON "Invite"("inviteeEmail");
CREATE INDEX IF NOT EXISTS "Invite_inviteeId_idx" ON "Invite"("inviteeId");
CREATE INDEX IF NOT EXISTS "Invite_inviterId_idx" ON "Invite"("inviterId");
