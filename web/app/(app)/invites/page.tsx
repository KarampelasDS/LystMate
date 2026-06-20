"use client";

import { useEffect, useState } from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineEnvelope, HiOutlineTrash } from "react-icons/hi2";
import { FaceAvatar } from "@/app/components/face-avatar";
import { invites, type Invite } from "@/app/lib/api";
import { Alert } from "@/app/components/alert";

type SentInvite = Invite & { invitee: { id: string; name: string; email: string } };
type ReceivedInvite = Invite & { inviter: { id: string; name: string; email: string } };

function SkeletonRows() {
  return (
    <div className="divide-y divide-warm-border">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center px-5 py-4 gap-4">
          <div className="skeleton w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function InvitesPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");

  const [received, setReceived] = useState<ReceivedInvite[]>([]);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedTotalPages, setReceivedTotalPages] = useState(1);
  const [sent, setSent] = useState<SentInvite[]>([]);
  const [sentPage, setSentPage] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function loadReceived(p = 1) {
    setLoadingReceived(true);
    try {
      const res = await invites.getAll(p);
      setReceived(res.data as ReceivedInvite[]);
      setReceivedPage(p);
      setReceivedTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invites");
    } finally {
      setLoadingReceived(false);
    }
  }

  async function loadSent(p = 1) {
    setLoadingSent(true);
    try {
      const res = await invites.getSent(p);
      setSent(res.data as SentInvite[]);
      setSentPage(p);
      setSentTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sent invites");
    } finally {
      setLoadingSent(false);
    }
  }

  useEffect(() => { loadReceived(); loadSent(); }, []);

  async function handleRespond(id: string, response: "ACCEPTED" | "REJECTED") {
    setMsg(""); setError("");
    try {
      await invites.respond(id, response);
      setMsg(response === "ACCEPTED" ? "Joined list." : "Invite declined.");
      loadReceived();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to respond");
    }
  }

  async function handleRevoke(id: string) {
    setMsg(""); setError("");
    try {
      await invites.cancel(id);
      setMsg("Invite revoked.");
      loadSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invite");
    }
  }

  const tabClass = (t: typeof tab) =>
    `px-4 py-2 text-sm rounded-xl font-medium transition-colors duration-150 cursor-pointer select-none ${
      tab === t ? "bg-espresso text-warm-white" : "text-warm-brown hover:text-espresso"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso">Invites</h1>
        <div className="flex gap-1 bg-warm-white border border-warm-border rounded-xl p-1">
          <button className={tabClass("received")} onClick={() => setTab("received")}>
            Received {received.length > 0 && <span className="ml-1 text-xs opacity-70">{received.length}</span>}
          </button>
          <button className={tabClass("sent")} onClick={() => setTab("sent")}>
            Sent {sent.length > 0 && <span className="ml-1 text-xs opacity-70">{sent.length}</span>}
          </button>
        </div>
      </div>

      {error && <div className="mb-4"><Alert message={error} onDismiss={() => setError("")} /></div>}
      {msg && <div className="mb-4"><Alert message={msg} onDismiss={() => setMsg("")} variant="info" /></div>}

      {tab === "received" && (
        <>
        <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
          {loadingReceived ? (
            <SkeletonRows />
          ) : received.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <HiOutlineEnvelope className="w-8 h-8 text-warm-muted mx-auto mb-3" />
              <p className="font-serif italic text-warm-brown text-lg">No pending invites</p>
              <p className="text-xs text-warm-muted mt-1">When someone invites you to a list, it'll show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {received.map((invite) => (
                <div key={invite.id} className="flex items-center px-5 py-3.5 gap-4 hover:bg-cream transition-colors duration-150">
                  <FaceAvatar name={invite.inviter.name} size={32} className="rounded-full overflow-hidden shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-espresso font-medium truncate">{invite.inviter.name}</p>
                    <p className="text-xs text-warm-muted truncate mt-0.5">
                      {invite.list.name} · as <span className="capitalize">{invite.role.toLowerCase()}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(invite.id, "ACCEPTED")}
                      className="flex items-center gap-1 text-sm sm:text-xs bg-espresso text-warm-white px-3.5 py-2 sm:py-1.5 rounded-lg hover:bg-espresso-light active:scale-95 transition-all duration-150 cursor-pointer select-none"
                    >
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(invite.id, "REJECTED")}
                      className="flex items-center gap-1 text-sm sm:text-xs border border-warm-border text-warm-brown px-3.5 py-2 sm:py-1.5 rounded-lg hover:border-warm-muted hover:text-espresso active:scale-95 transition-all duration-150 cursor-pointer select-none"
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
        {receivedTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button onClick={() => loadReceived(receivedPage - 1)} disabled={receivedPage === 1 || loadingReceived} className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">Previous</button>
            <span className="text-sm text-warm-muted">{receivedPage} / {receivedTotalPages}</span>
            <button onClick={() => loadReceived(receivedPage + 1)} disabled={receivedPage === receivedTotalPages || loadingReceived} className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">Next</button>
          </div>
        )}
        </>
      )}

      {tab === "sent" && (
        <>
        <div className="bg-warm-white border border-warm-border rounded-2xl overflow-hidden">
          {loadingSent ? (
            <SkeletonRows />
          ) : sent.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <HiOutlineEnvelope className="w-8 h-8 text-warm-muted mx-auto mb-3" />
              <p className="font-serif italic text-warm-brown text-lg">No pending sent invites</p>
              <p className="text-xs text-warm-muted mt-1">Invites you send will appear here until accepted or declined.</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {sent.map((invite) => (
                <div key={invite.id} className="flex items-center px-5 py-3.5 gap-4 hover:bg-cream transition-colors duration-150">
                  <FaceAvatar name={invite.invitee?.name ?? invite.inviteeEmail} size={32} className="rounded-full overflow-hidden shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-espresso font-medium truncate">
                      {invite.invitee?.name ?? <span className="text-warm-muted italic">No account yet</span>}
                    </p>
                    <p className="text-xs text-warm-muted truncate mt-0.5">
                      {invite.inviteeEmail} · {invite.list.name} · as <span className="capitalize">{invite.role.toLowerCase()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    className="flex items-center gap-1.5 text-sm sm:text-xs border border-red-200 text-red-500 px-3.5 py-2 sm:py-1.5 rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer select-none shrink-0"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {sentTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button onClick={() => loadSent(sentPage - 1)} disabled={sentPage === 1 || loadingSent} className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">Previous</button>
            <span className="text-sm text-warm-muted">{sentPage} / {sentTotalPages}</span>
            <button onClick={() => loadSent(sentPage + 1)} disabled={sentPage === sentTotalPages || loadingSent} className="px-3 py-1.5 text-sm border border-warm-border rounded-lg text-warm-brown hover:text-espresso hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">Next</button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
