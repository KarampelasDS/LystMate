"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineChevronRight } from "react-icons/hi2";
import { useAuth } from "@/app/contexts/auth-context";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await lists.getAll();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await lists.create(newName, newVisibility);
      setNewName("");
      setCreating(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create list");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl text-espresso leading-tight">
            Hey, {user?.name} 👋
          </h1>
          <p className="text-warm-brown text-sm mt-0.5">
            {loading ? "" : `${data.length} list${data.length !== 1 ? "s" : ""}`}
          </p>
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
              className="w-full border border-warm-border rounded-xl px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors duration-150 font-serif italic placeholder:not-italic placeholder:font-sans"
            />
          </div>
          <div className="flex gap-2">
            {(["PRIVATE", "PUBLIC"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNewVisibility(v)}
                className={`flex-1 text-sm py-2.5 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                  newVisibility === v
                    ? "bg-espresso text-warm-white border-transparent"
                    : "border-warm-border text-warm-brown hover:border-warm-muted"
                }`}
              >
                {v.charAt(0) + v.slice(1).toLowerCase()}
              </button>
            ))}
            <button
              type="submit"
              className="flex-1 bg-espresso text-warm-white text-sm py-2.5 rounded-xl hover:bg-espresso-light active:scale-[0.97] transition-all duration-150 cursor-pointer select-none"
            >
              Create
            </button>
          </div>
          {formError && <p className="text-xs text-red-700">{formError}</p>}
        </form>
      )}

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
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
            {data.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="flex items-center px-5 py-5 hover:bg-cream active:bg-warm-border transition-colors duration-150 group cursor-pointer"
              >
                <div className="flex-1">
                  <span className="font-serif italic text-2xl text-espresso group-hover:text-espresso-light transition-colors duration-150 leading-snug">
                    {list.name}
                  </span>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {list.visibility === "PUBLIC" ? "Public" : "Private"}
                  </p>
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-warm-muted ml-3 shrink-0 group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
