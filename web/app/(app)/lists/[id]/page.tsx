"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineXMark,
  HiOutlineArrowTopRightOnSquare, HiOutlineUserMinus,
  HiOutlineTrash, HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { FaceAvatar } from "@/app/components/face-avatar";
import { useAuth } from "@/app/contexts/auth-context";
import { lists, items, invites, type List, type Item, type Member } from "@/app/lib/api";

type Tab = "items" | "members" | "settings";

function SkeletonItems() {
  return (
    <div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center py-3.5 border-b border-warm-border gap-3">
          <div className="skeleton w-4 h-4 rounded" />
          <div className="skeleton h-4 flex-1 max-w-56" />
        </div>
      ))}
    </div>
  );
}

function SkeletonMembers() {
  return (
    <div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center py-3.5 border-b border-warm-border gap-3">
          <div className="skeleton w-7 h-7 rounded-full" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-12 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [list, setList] = useState<List | null>(null);
  const [myRole, setMyRole] = useState<"OWNER" | "MEMBER" | "VIEWER" | null>(null);
  const [tab, setTab] = useState<Tab>("items");
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);

  const [itemList, setItemList] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"VIEWER" | "MEMBER">("VIEWER");
  const [inviteMsg, setInviteMsg] = useState("");

  const [renameName, setRenameName] = useState("");
  const [renameMsg, setRenameMsg] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [visMsg, setVisMsg] = useState("");
  const [transferId, setTransferId] = useState("");
  const [transferMsg, setTransferMsg] = useState("");

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const l = await lists.get(id);
      setList(l);
      setRenameName(l.name);
      setVisibility(l.visibility);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load list");
    } finally {
      setListLoading(false);
    }
  }, [id]);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await items.getAll(id);
      setItemList(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setItemsLoading(false);
    }
  }, [id]);

  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await lists.getMembers(id);
      setMembers(res.data);
      const me = res.data.find((m) => m.userId === user?.id);
      setMyRole(me?.role ?? null);
    } catch {
      // public list
    } finally {
      setMembersLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadList();
    loadItems();
    loadMembers();
  }, [loadList, loadItems, loadMembers]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await items.create(id, newItemName, newItemUrl || undefined, newItemQty);
      setNewItemName(""); setNewItemUrl(""); setNewItemQty(1); setAddingItem(false);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function handleToggle(item: Item) {
    try { await items.update(id, item.id, { checked: !item.checked }); loadItems(); } catch {}
  }

  async function handleUpdateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await items.update(id, editingItem.id, {
        name: editingItem.name,
        url: editingItem.url ?? null,
        quantity: editingItem.quantity,
      });
      setEditingItem(null);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  }

  async function handleDeleteItem(itemId: string) {
    try { await items.delete(id, itemId); loadItems(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete item"); }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg("");
    try {
      await invites.send(id, inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteMsg("Invite sent.");
    } catch (err) {
      setInviteMsg(err instanceof Error ? err.message : "Failed to send invite");
    }
  }

  async function handleRemoveMember(memberId: string) {
    try { await lists.removeMember(id, memberId); loadMembers(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to remove member"); }
  }

  async function handleUpdateRole(memberId: string, role: "MEMBER" | "VIEWER") {
    try { await lists.updateMember(id, memberId, role); loadMembers(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to update role"); }
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault(); setRenameMsg("");
    try { const u = await lists.rename(id, renameName); setList(u); setRenameMsg("Renamed."); }
    catch (err) { setRenameMsg(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleVisibility(e: React.FormEvent) {
    e.preventDefault(); setVisMsg("");
    try { const u = await lists.changeVisibility(id, visibility); setList(u); setVisMsg("Updated."); }
    catch (err) { setVisMsg(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault(); setTransferMsg("");
    try {
      await lists.transferOwnership(id, transferId);
      setTransferMsg("Ownership transferred."); setTransferId(""); loadMembers();
    } catch (err) { setTransferMsg(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleLeave() {
    if (!confirm("Leave this list?")) return;
    try { await lists.leave(id); router.replace("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to leave"); }
  }

  async function handleDelete() {
    if (!confirm("Delete this list? This cannot be undone.")) return;
    try { await lists.delete(id); router.replace("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
  }

  if (listLoading) return (
    <div>
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-3 w-24 mb-6" />
      <SkeletonItems />
    </div>
  );

  if (!list) return <p className="text-sm text-red-700">{error || "List not found."}</p>;

  const isOwner = myRole === "OWNER";
  const canWrite = myRole === "OWNER" || myRole === "MEMBER";

  const tabClass = (t: Tab) =>
    `px-4 py-2.5 sm:px-3 sm:py-1.5 text-base sm:text-sm rounded-xl sm:rounded-lg transition-all duration-150 active:scale-95 cursor-pointer select-none ${
      tab === t ? "bg-espresso text-warm-white" : "text-warm-brown hover:text-espresso hover:bg-cream"
    }`;

  const inputClass = "w-full border border-warm-border rounded-xl px-3 py-2 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors duration-150";
  const btnPrimary = "bg-espresso text-warm-white text-sm px-4 py-2 rounded-xl hover:bg-espresso-light active:scale-[0.97] transition-all duration-150 cursor-pointer select-none";
  const btnSecondary = "border border-warm-border text-warm-brown text-sm px-4 py-2 rounded-xl hover:border-warm-muted hover:text-espresso active:scale-[0.97] transition-all duration-150 cursor-pointer select-none";

  return (
    <div>
      <div className="flex items-start justify-between mb-0">
        <div>
          <h1 className="font-serif italic text-3xl sm:text-4xl text-espresso leading-tight">{list.name}</h1>
          <p className="text-xs text-warm-muted mt-0.5">
            {list.visibility === "PUBLIC" ? "public" : "private"} · {(myRole ?? "viewer").toLowerCase()}
          </p>
        </div>
        {!isOwner && myRole && (
          <button
            onClick={handleLeave}
            title="Leave list"
            className="flex items-center gap-1 text-xs text-warm-muted hover:text-red-700 active:scale-95 transition-all duration-150 cursor-pointer select-none mt-1"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            Leave
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2 mb-3">{error}</p>}

      <div className="flex gap-1 mb-4 mt-3 border-b border-warm-border pb-2.5">
        <button className={tabClass("items")} onClick={() => setTab("items")}>Items</button>
        <button className={tabClass("members")} onClick={() => setTab("members")}>Members</button>
        {isOwner && <button className={tabClass("settings")} onClick={() => setTab("settings")}>Settings</button>}
      </div>

      {/* ITEMS */}
      {tab === "items" && (
        <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden mb-4">
          {itemsLoading ? (
            <div className="px-5 py-1"><SkeletonItems /></div>
          ) : itemList.length === 0 && !addingItem ? (
            <div className="px-5 py-6 text-center">
              <p className="font-serif italic text-warm-brown">Nothing here yet…</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {itemList.map((item) =>
                editingItem?.id === item.id ? (
                  <form key={item.id} onSubmit={handleUpdateItem} className="px-5 py-3 flex flex-wrap gap-2 items-center bg-cream">
                    <input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      required
                      className="border border-warm-border rounded-lg px-2 py-1.5 text-sm bg-warm-white flex-1 min-w-32 font-serif italic focus:outline-none focus:border-espresso"
                    />
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                      min={1} max={9999}
                      className="border border-warm-border rounded-lg px-2 py-1.5 text-sm bg-warm-white w-16 focus:outline-none focus:border-espresso"
                    />
                    <input
                      type="url"
                      value={editingItem.url ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value || null })}
                      placeholder="URL"
                      className="border border-warm-border rounded-lg px-2 py-1.5 text-sm bg-warm-white flex-1 min-w-32 focus:outline-none focus:border-espresso"
                    />
                    <button type="submit" className="text-xs bg-espresso text-warm-white px-3 py-1.5 rounded-lg hover:bg-espresso-light active:scale-95 transition-all duration-150 cursor-pointer select-none">Save</button>
                    <button type="button" onClick={() => setEditingItem(null)} className="text-xs text-warm-brown hover:text-espresso active:scale-95 transition-all duration-150 cursor-pointer">Cancel</button>
                  </form>
                ) : (
                  <div key={item.id} className="flex items-center px-5 py-3.5 hover:bg-cream active:bg-warm-border transition-colors duration-150 group gap-3">
                    {canWrite ? (
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggle(item)}
                        className="accent-espresso w-4 h-4 shrink-0 cursor-pointer rounded"
                      />
                    ) : (
                      <span className={`w-4 h-4 shrink-0 rounded border border-warm-border flex items-center justify-center text-xs ${item.checked ? "bg-espresso border-espresso" : ""}`}>
                        {item.checked && <span className="text-warm-white text-[10px]">✓</span>}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`font-serif italic ${item.checked ? "line-through text-warm-muted" : "text-espresso"}`}>
                        {item.quantity > 1 && (
                          <span className="not-italic font-sans text-xs font-medium text-warm-brown mr-1.5">{item.quantity}×</span>
                        )}
                        {item.name}
                      </span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-xs text-warm-muted hover:text-espresso hover:underline truncate mt-0.5 transition-colors w-fit"
                        >
                          <HiOutlineArrowTopRightOnSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </a>
                      )}
                    </div>
                    {canWrite && (
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                        <button
                          onClick={() => setEditingItem(item)}
                          title="Edit"
                          className="p-1.5 text-warm-muted hover:text-espresso hover:bg-warm-border rounded-lg active:scale-90 transition-all duration-150 cursor-pointer"
                        >
                          <HiOutlinePencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Remove"
                          className="p-1.5 text-warm-muted hover:text-red-700 hover:bg-red-50 rounded-lg active:scale-90 transition-all duration-150 cursor-pointer"
                        >
                          <HiOutlineXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {canWrite && (
            addingItem ? (
              <form onSubmit={handleAddItem} className={`flex flex-wrap gap-2 items-center px-5 py-3 bg-cream ${itemList.length > 0 ? "border-t border-warm-border" : ""}`}>
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  maxLength={255}
                  placeholder="Item name…"
                  autoFocus
                  className="border border-warm-border rounded-lg px-2 py-1.5 text-sm bg-warm-white flex-1 min-w-32 font-serif italic placeholder:not-italic placeholder:font-sans focus:outline-none focus:border-espresso"
                />
                <input
                  type="number"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  min={1} max={9999}
                  className="border border-warm-border rounded-lg px-2 py-1.5 text-sm bg-warm-white w-16 focus:outline-none focus:border-espresso"
                />
                <input
                  type="url"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder="URL (optional)"
                  className="border border-warm-border rounded-lg px-2 py-1.5 text-sm bg-warm-white flex-1 min-w-32 focus:outline-none focus:border-espresso"
                />
                <button type="submit" className="text-xs bg-espresso text-warm-white px-3 py-1.5 rounded-lg hover:bg-espresso-light active:scale-95 transition-all duration-150 cursor-pointer select-none">Add</button>
                <button type="button" onClick={() => setAddingItem(false)} className="text-xs text-warm-brown hover:text-espresso active:scale-95 transition-all duration-150 cursor-pointer">Cancel</button>
              </form>
            ) : (
              <button
                onClick={() => setAddingItem(true)}
                className={`w-full flex items-center gap-1.5 px-5 py-3 text-sm text-warm-muted hover:text-warm-brown hover:bg-cream active:bg-warm-border transition-all duration-150 cursor-pointer ${itemList.length > 0 ? "border-t border-warm-border" : ""}`}
              >
                <HiOutlinePlus className="w-4 h-4" />
                <span className="font-serif italic">Add an item…</span>
              </button>
            )
          )}
        </div>
      )}

      {/* MEMBERS */}
      {tab === "members" && (
        <div className="space-y-4">
          {isOwner && (
            <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
              <h2 className="font-serif text-base mb-3">Invite someone</h2>
              <form onSubmit={handleSendInvite} className="flex gap-2 items-end flex-wrap">
                <div className="flex-1 min-w-40">
                  <label className="block text-xs font-medium text-warm-brown mb-1 uppercase tracking-wide">Email</label>
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="friend@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-warm-brown mb-1 uppercase tracking-wide">Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "VIEWER" | "MEMBER")} className="border border-warm-border rounded-xl px-3 py-2 text-sm bg-cream focus:outline-none">
                    <option value="VIEWER">Viewer</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>
                <button type="submit" className={btnPrimary}>Invite</button>
              </form>
              {inviteMsg && <p className="text-xs mt-2 text-warm-brown">{inviteMsg}</p>}
            </div>
          )}

          <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
            {membersLoading ? (
              <div className="px-5 py-1"><SkeletonMembers /></div>
            ) : (
              <div className="divide-y divide-warm-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center px-5 py-3 gap-3">
                    <FaceAvatar name={m.user.name} size={28} className="rounded-full overflow-hidden" />
                    <div className="flex-1">
                      <p className="text-sm text-espresso">{m.user.name}</p>
                      <p className="text-xs text-warm-muted capitalize">{m.role.toLowerCase()}</p>
                    </div>
                    {isOwner && m.userId !== user?.id && (
                      <div className="flex items-center gap-2">
                        <select
                          value={m.role === "OWNER" ? "MEMBER" : m.role}
                          onChange={(e) => handleUpdateRole(m.userId, e.target.value as "MEMBER" | "VIEWER")}
                          disabled={m.role === "OWNER"}
                          className="text-xs border border-warm-border rounded-lg px-2 py-1.5 bg-cream disabled:opacity-50"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          title="Remove member"
                          className="p-1.5 text-warm-muted hover:text-red-700 hover:bg-red-50 rounded-lg active:scale-90 transition-all duration-150 cursor-pointer"
                        >
                          <HiOutlineUserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {tab === "settings" && isOwner && (
        <div className="space-y-4">
          <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
            <h2 className="font-serif text-base mb-3">Rename</h2>
            <form onSubmit={handleRename} className="flex gap-2">
              <input value={renameName} onChange={(e) => setRenameName(e.target.value)} required maxLength={100} className={`${inputClass} flex-1`} />
              <button type="submit" className={btnPrimary}>Save</button>
            </form>
            {renameMsg && <p className="text-xs mt-2 text-warm-brown">{renameMsg}</p>}
          </div>

          <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
            <h2 className="font-serif text-base mb-3">Visibility</h2>
            <form onSubmit={handleVisibility} className="flex gap-2 items-center">
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")} className="border border-warm-border rounded-xl px-3 py-2 text-sm bg-cream focus:outline-none">
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
              <button type="submit" className={btnPrimary}>Save</button>
            </form>
            {visMsg && <p className="text-xs mt-2 text-warm-brown">{visMsg}</p>}
          </div>

          <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
            <h2 className="font-serif text-base mb-1">Transfer ownership</h2>
            <p className="text-xs text-warm-muted mb-3">The selected member will become the new owner.</p>
            {members.filter((m) => m.role !== "OWNER").length === 0 ? (
              <p className="text-xs text-warm-muted italic">No other members to transfer to yet.</p>
            ) : (
              <form onSubmit={handleTransfer} className="flex gap-2">
                <select
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                  required
                  className="border border-warm-border rounded-xl px-3 py-2 text-sm bg-cream focus:outline-none focus:border-espresso flex-1 transition-colors duration-150"
                >
                  <option value="">Select a member…</option>
                  {members
                    .filter((m) => m.role !== "OWNER")
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name} ({m.role.toLowerCase()})
                      </option>
                    ))}
                </select>
                <button type="submit" className={btnSecondary}>Transfer</button>
              </form>
            )}
            {transferMsg && <p className="text-xs mt-2 text-warm-brown">{transferMsg}</p>}
          </div>

          <div className="bg-warm-white border border-red-200 rounded-2xl p-4">
            <h2 className="font-serif text-base text-red-700 mb-3">Danger zone</h2>
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm text-red-700 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer select-none">
              <HiOutlineTrash className="w-4 h-4" />
              Delete this list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
