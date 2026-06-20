const BASE = typeof window === "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001")
  : "/api";

// ── token storage ────────────────────────────────────────────────────────────

let _token: string | null = null;
let _onUnauthenticated: (() => void) | null = null;

export function setToken(t: string | null) { _token = t; }
export function getToken(): string | null { return _token; }
export function setUnauthenticatedHandler(fn: () => void) { _onUnauthenticated = fn; }

// ── types ────────────────────────────────────────────────────────────────────

export type User = { id: string; name: string; email: string };
export const LIST_THEMES = ["default","rose","sage","ocean","lavender","sunset","slate","forest"] as const;
export type ListTheme = typeof LIST_THEMES[number];

export type List = {
  id: string;
  name: string;
  visibility: "PUBLIC" | "PRIVATE";
  theme: ListTheme;
  createdAt: string;
  updatedAt: string;
};
export type Item = {
  id: string;
  name: string;
  url: string | null;
  quantity: number;
  checked: boolean;
  listId: string;
};
export type Member = {
  id: string;
  userId: string;
  listId: string;
  role: "OWNER" | "MEMBER" | "VIEWER";
  user: { id: string; name: string };
};
export type InviteUser = { id: string; name: string; email: string };
export type Invite = {
  id: string;
  listId: string;
  inviterId: string;
  inviteeId: string;
  role: string;
  status: string;
  list: List;
  inviter?: InviteUser;
  invitee?: InviteUser;
};
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ── core fetch ───────────────────────────────────────────────────────────────

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) { setToken(null); _onUnauthenticated?.(); return null; }
    const data = await res.json();
    setToken(data.token);
    return data.token as string;
  })().finally(() => { refreshing = null; });
  return refreshing;
}

async function apiFetch(
  path: string,
  init?: RequestInit,
  skipRefresh = false
): Promise<Response> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401 && !skipRefresh) {
    const newToken = await doRefresh();
    if (newToken) return apiFetch(path, init, true);
  }

  return res;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ── auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (name: string, email: string, password: string) =>
    json<{ message: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    json<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    json<{ message: string }>("/auth/logout", { method: "POST" }),

  logoutAll: () =>
    json<{ message: string }>("/auth/sessions", { method: "DELETE" }),

  verifyEmail: (token: string) =>
    json<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email: string) =>
    json<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    json<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    json<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ── lists ─────────────────────────────────────────────────────────────────────

export const lists = {
  getAll: (page = 1, limit = 20) =>
    json<Paginated<List>>(`/lists?page=${page}&limit=${limit}`),

  get: (id: string) => json<List>(`/lists/${id}`),

  create: (name: string, visibility: "PUBLIC" | "PRIVATE" = "PRIVATE") =>
    json<List>("/lists", {
      method: "POST",
      body: JSON.stringify({ name, visibility }),
    }),

  rename: (id: string, name: string) =>
    json<List>(`/lists/${id}/rename`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  changeVisibility: (id: string, visibility: "PUBLIC" | "PRIVATE") =>
    json<List>(`/lists/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ visibility }),
    }),

  changeTheme: (id: string, theme: ListTheme) =>
    json<List>(`/lists/${id}/theme`, {
      method: "PATCH",
      body: JSON.stringify({ theme }),
    }),

  delete: (id: string) => apiFetch(`/lists/${id}`, { method: "DELETE" }),

  leave: (id: string) => apiFetch(`/lists/${id}/leave`, { method: "DELETE" }),

  getMembers: (id: string, page = 1, limit = 20) =>
    json<Paginated<Member>>(`/lists/${id}/members?page=${page}&limit=${limit}`),

  removeMember: (id: string, memberId: string) =>
    apiFetch(`/lists/${id}/members/${memberId}`, { method: "DELETE" }),

  updateMember: (id: string, memberId: string, role: "MEMBER" | "VIEWER") =>
    json<Member>(`/lists/${id}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  transferOwnership: (id: string, newOwnerId: string) =>
    json<{ success: boolean }>(`/lists/${id}/transfer`, {
      method: "PATCH",
      body: JSON.stringify({ newOwnerId }),
    }),
};

// ── items ─────────────────────────────────────────────────────────────────────

export const items = {
  getAll: (listId: string, page = 1, limit = 50) =>
    json<Paginated<Item>>(`/lists/${listId}/items?page=${page}&limit=${limit}`),

  create: (listId: string, name: string, url?: string, quantity?: number) =>
    json<Item>(`/lists/${listId}/items`, {
      method: "POST",
      body: JSON.stringify({ name, url, quantity }),
    }),

  update: (
    listId: string,
    itemId: string,
    data: { name?: string; url?: string | null; quantity?: number; checked?: boolean }
  ) =>
    json<Item>(`/lists/${listId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (listId: string, itemId: string) =>
    apiFetch(`/lists/${listId}/items/${itemId}`, { method: "DELETE" }),
};

// ── invites ───────────────────────────────────────────────────────────────────

export const invites = {
  getAll: (page = 1, limit = 20) =>
    json<Paginated<Invite>>(`/invites?page=${page}&limit=${limit}`),

  send: (listId: string, inviteeEmail: string, role: "VIEWER" | "MEMBER" = "VIEWER") =>
    json<Invite>("/invites", {
      method: "POST",
      body: JSON.stringify({ listId, inviteeEmail, role }),
    }),

  respond: (id: string, response: "ACCEPTED" | "REJECTED") =>
    json<Invite>(`/invites/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ response }),
    }),

  getSent: (page = 1, limit = 20) =>
    json<Paginated<Invite & { invitee: { id: string; name: string; email: string } }>>(`/invites/sent?page=${page}&limit=${limit}`),

  cancel: (id: string) => apiFetch(`/invites/${id}`, { method: "DELETE" }),
};

// ── users ─────────────────────────────────────────────────────────────────────

export const users = {
  getMe: () => json<User>("/users/me"),

  update: (name: string) =>
    json<{ message: string; user: { name: string; email: string } }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  requestEmailChange: (email: string) =>
    json<{ message: string }>("/users/me/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};
