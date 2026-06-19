"use client";

import { useEffect, useState } from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineEnvelope } from "react-icons/hi2";
import { FaceAvatar } from "@/app/components/face-avatar";
import { invites, type Invite } from "@/app/lib/api";

function SkeletonInvites() {
  return (
    <div className="divide-y divide-warm-border">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center px-5 py-4 gap-4">
          <div className="skeleton w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InvitesPage() {
  const [data, setData] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await invites.getAll();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRespond(id: string, response: "ACCEPTED" | "REJECTED") {
    setMsg("");
    try {
      await invites.respond(id, response);
      setMsg(response === "ACCEPTED" ? "Joined list." : "Invite declined.");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to respond");
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso">Invites</h1>
        {!loading && data.length > 0 && (
          <span className="text-xs text-warm-muted">{data.length} pending</span>
        )}
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>}
      {msg && <p className="text-sm text-warm-brown mb-4">{msg}</p>}

      <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
        {loading ? (
          <SkeletonInvites />
        ) : data.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <HiOutlineEnvelope className="w-8 h-8 text-warm-muted mx-auto mb-3" />
            <p className="font-serif italic text-warm-brown text-lg">No pending invites</p>
            <p className="text-xs text-warm-muted mt-1">When someone invites you to a list, it'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-border">
            {data.map((invite) => (
              <div key={invite.id} className="flex items-center px-5 py-3.5 gap-4 hover:bg-cream transition-colors duration-150">
                <FaceAvatar name={invite.list.name} size={32} className="rounded-full overflow-hidden" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif italic text-espresso truncate">{invite.list.name}</p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    as <span className="capitalize">{invite.role.toLowerCase()}</span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleRespond(invite.id, "ACCEPTED")}
                    className="flex items-center gap-1 text-xs bg-espresso text-warm-white px-3 py-1.5 rounded-lg hover:bg-espresso-light active:scale-95 transition-all duration-150 cursor-pointer select-none"
                  >
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(invite.id, "REJECTED")}
                    className="flex items-center gap-1 text-xs border border-warm-border text-warm-brown px-3 py-1.5 rounded-lg hover:border-warm-muted hover:text-espresso active:scale-95 transition-all duration-150 cursor-pointer select-none"
                  >
                    <HiOutlineXCircle className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
