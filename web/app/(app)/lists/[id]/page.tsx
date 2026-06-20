"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineXMark,
  HiOutlineArrowTopRightOnSquare, HiOutlineUserMinus,
  HiOutlineTrash, HiOutlineArrowRightOnRectangle,
  HiOutlineChevronLeft,
} from "react-icons/hi2";
import { FaceAvatar } from "@/app/components/face-avatar";
import { CustomSelect } from "@/app/components/custom-select";
import { Alert } from "@/app/components/alert";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { useAuth } from "@/app/contexts/auth-context";
import { lists, items, invites, LIST_THEMES, type List, type Item, type Member, type ListTheme } from "@/app/lib/api";

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
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [sort, setSort] = useState<"default" | "name" | "unchecked">("default");

  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"VIEWER" | "MEMBER">("VIEWER");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [confirm, setConfirm] = useState<{ message: string; label: string; onConfirm: () => void } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [renameName, setRenameName] = useState("");
  const [renameMsg, setRenameMsg] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [visMsg, setVisMsg] = useState("");
  const [theme, setTheme] = useState<ListTheme>("default");
  const [themeMsg, setThemeMsg] = useState("");
  const [transferId, setTransferId] = useState("");
  const [transferMsg, setTransferMsg] = useState("");

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const l = await lists.get(id);
      setList(l);
      setRenameName(l.name);
      setVisibility(l.visibility);
      setTheme(l.theme ?? "default");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load list");
    } finally {
      setListLoading(false);
    }
  }, [id]);

  const loadItems = useCallback(async (p = 1) => {
    setItemsLoading(true);
    try {
      const res = await items.getAll(id, p);
      setItemList(res.data);
      setItemsPage(p);
      setItemsTotalPages(res.totalPages);
      setItemsTotal(res.total);
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

  const THEME_BG: Record<ListTheme, string> = {
    default:  "",
    rose:     "#fff0f3",
    sage:     "#edf7ed",
    ocean:    "#eaf4ff",
    lavender: "#f0eeff",
    sunset:   "#fff4ea",
    slate:    "#f4f7fa",
    forest:   "#edfbf1",
  };

  useEffect(() => {
    const bg = THEME_BG[theme];
    if (bg) document.body.style.backgroundColor = bg;
    return () => { document.body.style.backgroundColor = ""; };
  }, [theme]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await items.create(id, newItemName, newItemUrl || undefined, newItemQty);
      setNewItemName(""); setNewItemUrl(""); setNewItemQty(1); setAddingItem(false);
      loadItems(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function handleToggle(item: Item) {
    try { await items.update(id, item.id, { checked: !item.checked }); loadItems(itemsPage); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to update item"); }
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
      loadItems(itemsPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  }

  async function handleDeleteItem(itemId: string) {
    try { await items.delete(id, itemId); loadItems(itemsPage); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete item"); }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg(""); setInviteError("");
    try {
      await invites.send(id, inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteMsg("Invite sent.");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invite");
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
    if (renameName.trim() === list?.name) return;
    try { const u = await lists.rename(id, renameName); setList(u); setRenameMsg("Renamed."); }
    catch (err) { setRenameMsg(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleVisibility(e: React.FormEvent) {
    e.preventDefault(); setVisMsg("");
    if (visibility === list?.visibility) return;
    try { const u = await lists.changeVisibility(id, visibility); setList(u); setVisMsg("Updated."); }
    catch (err) { setVisMsg(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleTheme(t: ListTheme) {
    setTheme(t);
    setThemeMsg("");
    try {
      const u = await lists.changeTheme(id, t);
      setList(u);
      setThemeMsg("Theme saved.");
    } catch (err) {
      setThemeMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault(); setTransferMsg("");
    try {
      await lists.transferOwnership(id, transferId);
      setTransferMsg("Ownership transferred."); setTransferId(""); loadMembers();
    } catch (err) { setTransferMsg(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleLeave() {
    setConfirm({
      message: "Are you sure you want to leave this list?",
      label: "Leave",
      onConfirm: async () => {
        setConfirm(null); setActionLoading(true);
        try { await lists.leave(id); router.replace("/dashboard"); }
        catch (err) { setError(err instanceof Error ? err.message : "Failed to leave"); }
        finally { setActionLoading(false); }
      },
    });
  }

  async function handleDelete() {
    setConfirm({
      message: "Delete this list? This cannot be undone.",
      label: "Delete",
      onConfirm: async () => {
        setConfirm(null); setActionLoading(true);
        try { await lists.delete(id); router.replace("/dashboard"); }
        catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
        finally { setActionLoading(false); }
      },
    });
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

  const THEME_META: Record<ListTheme, { label: string; dot: string }> = {
    default:  { label: "Default",  dot: "#2c1810" },
    rose:     { label: "Rose",     dot: "#e11d48" },
    sage:     { label: "Sage",     dot: "#15803d" },
    ocean:    { label: "Ocean",    dot: "#0369a1" },
    lavender: { label: "Lavender", dot: "#7c3aed" },
    sunset:   { label: "Sunset",   dot: "#ea580c" },
    slate:    { label: "Slate",    dot: "#334155" },
    forest:   { label: "Forest",   dot: "#065f46" },
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2.5 sm:px-3 sm:py-1.5 text-base sm:text-sm rounded-xl sm:rounded-lg transition-all duration-150 active:scale-95 cursor-pointer select-none ${
      tab === t ? "bg-[var(--color-list-accent)] text-warm-white" : "text-warm-brown hover:text-espresso hover:bg-cream"
    }`;

  const inputClass = "w-full border border-warm-border rounded-xl px-3 py-3 sm:py-2 text-base sm:text-sm bg-cream focus:outline-none focus:border-espresso transition-colors duration-150";
  const btnPrimary = "bg-[var(--color-list-accent)] text-warm-white text-base sm:text-sm px-4 py-2.5 sm:py-2 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer select-none";
  const btnSecondary = "border border-warm-border text-warm-brown text-base sm:text-sm px-4 py-2.5 sm:py-2 rounded-xl hover:border-warm-muted hover:text-espresso active:scale-[0.97] transition-all duration-150 cursor-pointer select-none";

  return (
    <div data-theme={theme === "default" ? undefined : theme} className="transition-colors duration-300">
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          confirmLabel={confirm.label}
          destructive
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-espresso transition-colors duration-150 mb-3 active:scale-95"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Your lists
      </Link>

      <div className="flex items-start justify-between mb-0 min-w-0 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif italic text-3xl sm:text-4xl text-espresso leading-tight truncate">{list.name}</h1>
          <p className="text-xs text-warm-muted mt-0.5">
            {list.visibility === "PUBLIC" ? "public" : "private"} · {(myRole ?? "viewer").toLowerCase()} · {itemsTotal} {itemsTotal === 1 ? "item" : "items"}
          </p>
        </div>
        {!isOwner && myRole && (
          <button
            onClick={handleLeave}
            disabled={actionLoading}
            title="Leave list"
            className="flex items-center gap-1 text-xs text-warm-muted hover:text-red-700 active:scale-95 transition-all duration-150 cursor-pointer select-none mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            Leave
          </button>
        )}
      </div>

      {error && <div className="mb-3"><Alert message={error} onDismiss={() => setError("")} /></div>}

      <div className="flex gap-1 mb-4 mt-3 border-b border-warm-border pb-2.5">
        <button className={tabClass("items")} onClick={() => setTab("items")}>Items</button>
        <button className={tabClass("members")} onClick={() => setTab("members")}>Members</button>
        {isOwner && <button className={tabClass("settings")} onClick={() => setTab("settings")}>Settings</button>}
      </div>

      {/* ITEMS */}
      {tab === "items" && (
        <>
        <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden mb-4">
          {/* toolbar */}
          {!itemsLoading && (itemList.length > 0 || addingItem) && (
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-warm-border bg-cream/60">
              <div className="flex items-center gap-1.5">
                {canWrite && !addingItem ? (
                  <button
                    onClick={() => setAddingItem(true)}
                    className="flex items-center gap-1.5 bg-[var(--color-list-accent)] text-warm-white text-sm px-3.5 py-2 sm:py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer select-none"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                    Add item
                  </button>
                ) : (
                  <span className="text-sm font-medium text-espresso">Add item</span>
                )}
              </div>
              <CustomSelect
                size="sm"
                value={sort}
                onChange={(v) => setSort(v as typeof sort)}
                options={[{ value: "default", label: "Order added" }, { value: "name", label: "Name A–Z" }, { value: "unchecked", label: "Unchecked first" }]}
              />
            </div>
          )}

          {itemsLoading ? (
            <div className="px-5 py-1"><SkeletonItems /></div>
          ) : itemList.length === 0 && !addingItem ? (
            <div className="px-5 py-8 text-center">
              <p className="font-serif italic text-warm-muted text-sm mb-4">Nothing here yet…</p>
              {canWrite && (
                <button
                  onClick={() => setAddingItem(true)}
                  className="inline-flex items-center gap-2 bg-[var(--color-list-accent)] text-warm-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer select-none"
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  Add your first item
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {/* add form pinned to top */}
              {canWrite && addingItem && (
                <form onSubmit={handleAddItem} className="px-5 py-4 bg-cream space-y-3">
                  <div>
                    <input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required maxLength={255}
                      placeholder="Item name…"
                      autoFocus
                      className="w-full border border-warm-border rounded-xl px-3 py-3 sm:py-2.5 text-base sm:text-sm bg-warm-white font-serif italic placeholder:not-italic placeholder:font-sans focus:outline-none focus:border-espresso transition-colors"
                    />
                    <p className="text-xs text-warm-muted text-right mt-1">{newItemName.length} / 255</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-warm-muted mb-1">URL (optional)</label>
                      <input type="url" value={newItemUrl} onChange={(e) => setNewItemUrl(e.target.value.slice(0, 2048))} placeholder="https://…" maxLength={2048}
                        className="w-full border border-warm-border rounded-xl px-3 py-2 text-sm bg-warm-white focus:outline-none focus:border-espresso transition-colors" />
                      <p className="text-xs text-warm-muted text-right mt-1">{newItemUrl.length} / 2048</p>
                    </div>
                    <div className="w-20">
                      <label className="block text-xs text-warm-muted mb-1">Qty</label>
                      <input type="number" value={newItemQty} onChange={(e) => setNewItemQty(Number(e.target.value))} min={1} max={9999}
                        className="w-full border border-warm-border rounded-xl px-3 py-2 text-sm bg-warm-white focus:outline-none focus:border-espresso transition-colors" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-[var(--color-list-accent)] text-warm-white text-sm py-2.5 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer select-none">Add item</button>
                    <button type="button" onClick={() => { setAddingItem(false); setNewItemName(""); setNewItemUrl(""); setNewItemQty(1); }} className="px-4 text-sm text-warm-brown border border-warm-border rounded-xl hover:bg-warm-white active:scale-95 transition-all duration-150 cursor-pointer">Cancel</button>
                  </div>
                </form>
              )}
              {[...itemList]
                .sort((a, b) => {
                  if (sort === "name") return a.name.localeCompare(b.name);
                  if (sort === "unchecked") return Number(a.checked) - Number(b.checked);
                  return 0;
                })
                .map((item) =>
                editingItem?.id === item.id ? (
                  <form key={item.id} onSubmit={handleUpdateItem} className="px-5 py-4 bg-cream space-y-3">
                    <div>
                      <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} required maxLength={255}
                        placeholder="Item name…"
                        className="w-full border border-warm-border rounded-xl px-3 py-2.5 text-sm bg-warm-white font-serif italic placeholder:not-italic placeholder:font-sans focus:outline-none focus:border-espresso transition-colors" />
                      <p className="text-xs text-warm-muted text-right mt-1">{editingItem.name.length} / 255</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-warm-muted mb-1">URL (optional)</label>
                        <input type="url" value={editingItem.url ?? ""} onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value.slice(0, 2048) || null })} placeholder="https://…" maxLength={2048}
                          className="w-full border border-warm-border rounded-xl px-3 py-2 text-sm bg-warm-white focus:outline-none focus:border-espresso transition-colors" />
                        <p className="text-xs text-warm-muted text-right mt-1">{(editingItem.url ?? "").length} / 2048</p>
                      </div>
                      <div className="w-20">
                        <label className="block text-xs text-warm-muted mb-1">Qty</label>
                        <input type="number" value={editingItem.quantity} onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })} min={1} max={9999}
                          className="w-full border border-warm-border rounded-xl px-3 py-2 text-sm bg-warm-white focus:outline-none focus:border-espresso transition-colors" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-[var(--color-list-accent)] text-warm-white text-sm py-2.5 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer select-none">Save</button>
                      <button type="button" onClick={() => setEditingItem(null)} className="px-4 text-sm text-warm-brown border border-warm-border rounded-xl hover:bg-warm-white active:scale-95 transition-all duration-150 cursor-pointer">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div
                    key={item.id}
                    onClick={() => canWrite && handleToggle(item)}
                    className={`flex items-center px-5 py-3.5 hover:bg-cream transition-colors duration-150 group gap-3 ${canWrite ? "cursor-pointer" : ""}`}
                  >
                    {canWrite ? (
                      <input type="checkbox" checked={item.checked} onChange={() => handleToggle(item)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 shrink-0 cursor-pointer rounded" style={{ accentColor: "var(--color-list-accent)" }} />
                    ) : (
                      <span className="w-4 h-4 shrink-0 rounded border border-warm-border flex items-center justify-center text-xs" style={item.checked ? { background: "var(--color-list-accent)", borderColor: "var(--color-list-accent)" } : {}}>
                        {item.checked && <span className="text-warm-white text-[10px]">✓</span>}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-serif italic text-base sm:text-sm truncate ${item.checked ? "line-through text-warm-muted" : "text-espresso"}`}>
                        {item.quantity > 1 && <span className="not-italic font-sans text-sm sm:text-xs font-medium text-warm-brown mr-1.5">{item.quantity}×</span>}
                        {item.name}
                      </p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-0.5 text-xs text-warm-muted hover:text-espresso hover:underline mt-0.5 transition-colors min-w-0 max-w-full">
                          <HiOutlineArrowTopRightOnSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </a>
                      )}
                    </div>
                    {canWrite && (
                      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEditingItem(item)} aria-label="Edit item" title="Edit" className="p-2 text-warm-muted hover:text-espresso hover:bg-warm-border rounded-lg active:scale-90 transition-all duration-150 cursor-pointer">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} aria-label="Remove item" title="Remove" className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg active:scale-90 transition-all duration-150 cursor-pointer">
                          <HiOutlineXMark className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
        {itemsTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => loadItems(itemsPage - 1)}
              disabled={itemsPage === 1 || itemsLoading}
              className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-warm-muted">{itemsPage} / {itemsTotalPages}</span>
            <button
              onClick={() => loadItems(itemsPage + 1)}
              disabled={itemsPage === itemsTotalPages || itemsLoading}
              className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}

      {/* MEMBERS */}
      {tab === "members" && (
        <div className="space-y-4">
          {isOwner && (
            <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
              <h2 className="font-serif text-base mb-3">Invite someone</h2>
              <form onSubmit={handleSendInvite} className="flex flex-col gap-2">
                <div>
                  <label className="block text-xs font-medium text-warm-brown mb-1 uppercase tracking-wide">Email</label>
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value.slice(0, 254))} required maxLength={254} placeholder="friend@example.com" className={inputClass} />
                  <p className="text-xs text-warm-muted mt-1">{inviteEmail.length} / 254</p>
                </div>
                <div className="flex gap-2 items-end">
                  <div>
                    <label className="block text-xs font-medium text-warm-brown mb-1 uppercase tracking-wide">Role</label>
                    <CustomSelect
                      value={inviteRole}
                      onChange={(v) => setInviteRole(v as "VIEWER" | "MEMBER")}
                      options={[{ value: "VIEWER", label: "Viewer" }, { value: "MEMBER", label: "Member" }]}
                    />
                  </div>
                  <button type="submit" className={btnPrimary}>Invite</button>
                </div>
              </form>
              {inviteError && <div className="mt-2"><Alert message={inviteError} onDismiss={() => setInviteError("")} /></div>}
              {inviteMsg && <div className="mt-2"><Alert message={inviteMsg} onDismiss={() => setInviteMsg("")} variant="info" /></div>}
            </div>
          )}

          <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
            {membersLoading ? (
              <div className="px-5 py-1"><SkeletonMembers /></div>
            ) : (
              <div className="divide-y divide-warm-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center px-5 py-3 gap-3 min-w-0">
                    <FaceAvatar name={m.user.name} size={28} className="rounded-full overflow-hidden shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-espresso truncate">{m.user.name}</p>
                      <p className="text-xs text-warm-muted capitalize">{m.role.toLowerCase()}</p>
                    </div>
                    {isOwner && m.userId !== user?.id && (
                      <div className="flex items-center gap-2">
                        <CustomSelect
                          size="sm"
                          value={m.role === "OWNER" ? "MEMBER" : m.role}
                          onChange={(v) => handleUpdateRole(m.userId, v as "MEMBER" | "VIEWER")}
                          options={[{ value: "MEMBER", label: "Member" }, { value: "VIEWER", label: "Viewer" }]}
                        />
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          title="Remove member"
                          aria-label="Remove member"
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
            <h2 className="font-serif text-base mb-3">Theme</h2>
            <div className="grid grid-cols-4 gap-2">
              {LIST_THEMES.map((t) => {
                const meta = THEME_META[t];
                const active = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleTheme(t)}
                    title={meta.label}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                      active ? "border-espresso" : "border-transparent hover:border-warm-border"
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full border border-warm-border flex items-center justify-center" style={{ background: meta.dot + "22" }}>
                      <span className="w-3 h-3 rounded-full" style={{ background: meta.dot }} />
                    </span>
                    <span className="text-[10px] text-warm-muted leading-none">{meta.label}</span>
                  </button>
                );
              })}
            </div>
            {themeMsg && <div className="mt-2"><Alert message={themeMsg} onDismiss={() => setThemeMsg("")} variant="info" /></div>}
          </div>

          <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
            <h2 className="font-serif text-base mb-3">Rename</h2>
            <form onSubmit={handleRename} className="flex gap-2 items-start">
              <div className="flex-1">
                <input value={renameName} onChange={(e) => setRenameName(e.target.value)} required maxLength={100} className={`${inputClass} w-full`} />
                <p className="text-xs text-warm-muted text-right mt-1">{renameName.length} / 100</p>
              </div>
              <button type="submit" disabled={renameName.trim() === list?.name} className={btnPrimary}>Save</button>
            </form>
            {renameMsg && <div className="mt-2"><Alert message={renameMsg} onDismiss={() => setRenameMsg("")} variant="info" /></div>}
          </div>

          <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
            <h2 className="font-serif text-base mb-3">Visibility</h2>
            <form onSubmit={handleVisibility} className="flex gap-2 items-center">
              <CustomSelect
                value={visibility}
                onChange={(v) => setVisibility(v as "PUBLIC" | "PRIVATE")}
                options={[{ value: "PRIVATE", label: "Private" }, { value: "PUBLIC", label: "Public" }]}
              />
              <button type="submit" disabled={visibility === list?.visibility} className={btnPrimary}>Save</button>
            </form>
            {visMsg && <div className="mt-2"><Alert message={visMsg} onDismiss={() => setVisMsg("")} variant="info" /></div>}
          </div>

          <div className="bg-warm-white border border-warm-border rounded-2xl p-4">
            <h2 className="font-serif text-base mb-1">Transfer ownership</h2>
            <p className="text-xs text-warm-muted mb-3">The selected member will become the new owner.</p>
            {members.filter((m) => m.role !== "OWNER").length === 0 ? (
              <p className="text-xs text-warm-muted italic">No other members to transfer to yet.</p>
            ) : (
              <form onSubmit={handleTransfer} className="flex gap-2">
                <CustomSelect
                  value={transferId}
                  onChange={(v) => setTransferId(v)}
                  className="flex-1"
                  options={[
                    { value: "", label: "Select a member…" },
                    ...members
                      .filter((m) => m.role !== "OWNER")
                      .map((m) => ({ value: m.userId, label: `${m.user.name} (${m.role.toLowerCase()})` })),
                  ]}
                />
                <button type="submit" disabled={!transferId} className={btnSecondary}>Transfer</button>
              </form>
            )}
            {transferMsg && <div className="mt-2"><Alert message={transferMsg} onDismiss={() => setTransferMsg("")} variant="info" /></div>}
          </div>

          <div className="bg-warm-white border border-red-200 rounded-2xl p-4">
            <h2 className="font-serif text-base text-red-700 mb-3">Danger zone</h2>
            <button onClick={handleDelete} disabled={actionLoading} className="flex items-center gap-1.5 text-sm text-red-700 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed">
              <HiOutlineTrash className="w-4 h-4" />
              Delete this list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
