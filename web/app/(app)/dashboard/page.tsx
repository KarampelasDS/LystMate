"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineChevronRight, HiCheck } from "react-icons/hi2";
import { CustomSelect } from "@/app/components/custom-select";
import { useAuth } from "@/app/contexts/auth-context";
import { Alert } from "@/app/components/alert";
import { lists, type List } from "@/app/lib/api";

function SkeletonList() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center py-5 border-b border-warm-border gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-6 max-w-48" />
            <div className="skeleton h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<List[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [formError, setFormError] = useState("");
  const [sort, setSort] = useState<"default" | "name">("default");

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await lists.getAll(p);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await lists.create(newName, newVisibility);
      setNewName("");
      setCreating(false);
      load(1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create list");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl sm:text-4xl text-espresso leading-tight truncate">
            Hey, {user?.name} <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f44b.svg" alt="👋" className="wave-emoji inline-block w-8 h-8 sm:w-10 sm:h-10 align-middle" />
          </h1>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className={`shrink-0 flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl border transition-all duration-150 active:scale-[0.97] cursor-pointer select-none ${
            creating
              ? "border-warm-border text-warm-brown hover:bg-cream"
              : "bg-espresso text-warm-white border-transparent hover:bg-espresso-light"
          }`}
        >
          {creating ? "Cancel" : <><HiOutlinePlus className="w-4 h-4" /> New list</>}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="bg-warm-white border border-warm-border rounded-2xl p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-warm-brown mb-1.5 uppercase tracking-wide">List name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Grocery run"
              autoFocus
              className="w-full border border-warm-border rounded-xl px-3 py-3 sm:py-2.5 text-base sm:text-sm bg-cream focus:outline-none focus:border-espresso transition-colors duration-150 font-serif italic placeholder:not-italic placeholder:font-sans"
            />
            <p className="text-xs text-warm-muted text-right mt-1">{newName.length} / 100</p>
          </div>
          <div className="flex gap-2">
            {(["PRIVATE", "PUBLIC"] as const).map((v) => {
              const selected = newVisibility === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setNewVisibility(v)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                    selected
                      ? "bg-warm-white border-espresso text-espresso font-medium"
                      : "border-warm-border text-warm-muted hover:border-warm-brown hover:text-warm-brown"
                  }`}
                >
                  {selected && <HiCheck className="w-3.5 h-3.5 shrink-0" />}
                  {v.charAt(0) + v.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            className="w-full bg-espresso text-warm-white text-base sm:text-sm py-3.5 sm:py-3 rounded-xl hover:bg-espresso-light active:scale-[0.97] transition-all duration-150 cursor-pointer select-none font-medium"
          >
            Create list
          </button>
          {formError && <p className="text-xs text-red-700">{formError}</p>}
        </form>
      )}

      {error && <div className="mb-4"><Alert message={error} onDismiss={() => setError("")} /></div>}

      <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
        {!loading && (
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-warm-border bg-cream/60">
            <span className="text-sm font-medium text-espresso">Your lists <span className="text-warm-muted font-normal">· {total}</span></span>
            {data.length > 1 && (
              <CustomSelect
                size="sm"
                value={sort}
                onChange={(v) => setSort(v as typeof sort)}
                options={[{ value: "default", label: "Order added" }, { value: "name", label: "Name A–Z" }]}
              />
            )}
          </div>
        )}
        {loading ? (
          <div className="px-5 py-2">
            <SkeletonList />
          </div>
        ) : data.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-serif italic text-warm-brown text-lg">Nothing here yet…</p>
            <p className="text-xs text-warm-muted mt-1">Create your first list to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-border">
            {[...data]
              .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : 0)
              .map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="flex items-center px-5 py-5 hover:bg-cream active:bg-warm-border transition-colors duration-150 group cursor-pointer min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-serif italic text-2xl text-espresso group-hover:text-espresso-light transition-colors duration-150 leading-snug truncate">
                    {list.name}
                  </p>
                  <p className="text-xs text-warm-muted mt-0.5 flex items-center gap-1.5">
                    <span>{list.visibility === "PUBLIC" ? "Public" : "Private"}</span>
                    <span className="text-warm-border">·</span>
                    <span>{list.itemCount ?? 0} {(list.itemCount ?? 0) === 1 ? "item" : "items"}</span>
                    <span className="text-warm-border">·</span>
                    <span className="capitalize">{list.role?.toLowerCase() ?? "member"}</span>
                  </p>
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-warm-muted ml-3 shrink-0 group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm text-warm-muted">{page} / {totalPages}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={page === totalPages || loading}
            className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
