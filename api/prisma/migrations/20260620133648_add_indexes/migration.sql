-- CreateIndex
CREATE INDEX "Invite_inviteeId_idx" ON "Invite"("inviteeId");

-- CreateIndex
CREATE INDEX "Invite_inviterId_idx" ON "Invite"("inviterId");

-- CreateIndex
CREATE INDEX "Item_listId_idx" ON "Item"("listId");

-- CreateIndex
CREATE INDEX "ListMember_listId_idx" ON "ListMember"("listId");
