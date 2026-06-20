# LystMate

<p align="center">
  <img src="web/public/icons/icon-192.png" alt="LystMate logo" width="96" height="96" />
</p>

<p align="center">
  <strong>Create, share and manage lists with friends and family.</strong>
</p>

<p align="center">
  <a href="https://www.lystmate.app">www.lystmate.app</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img alt="Railway" src="https://img.shields.io/badge/Railway-Backend-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
</p>

---

## What It Is

LystMate is a collaborative list-keeping web app and PWA built around simplicity and sharing. Users create lists, invite friends and family, and manage items together in real time. Each list supports roles, visibility settings, and colour themes so every list feels personal.

The app is designed to feel native on mobile — installable as a PWA, with a bottom navigation dock, smooth transitions, and a warm, considered visual style — while remaining fully functional on desktop.

## Feature Highlights

- **Collaborative lists** with role-based access — owners, members, and viewers each get the right level of control.
- **Item management** with quantities, URLs, check-off, inline editing, sorting, and pagination.
- **Invite system** with email-based invites, role selection, and accept/decline flows. Invites work even if the recipient doesn't have an account yet — they receive a sign-up link and the invite is linked automatically once they verify their email.
- **8 colour themes per list** — rose, sage, ocean, lavender, sunset, slate, forest, and default — cascading across backgrounds, cards, text, and accent colours.
- **Authentication** with JWT access tokens, httpOnly refresh cookies, email verification, forgot/reset password, and rate limiting.
- **Account management** — display name, email change with verification, password change, sign out all devices, and account deletion.
- **Transactional email** via Resend for welcome, email verification, email change alerts, and password reset.
- **PWA support** — installable on iOS and Android with a custom app icon, standalone display, and offline service worker.
- **SEO** — per-page metadata, Open Graph tags, `robots.txt`, and `sitemap.xml`.
- **Responsive design** with a desktop header nav and a mobile bottom dock, smooth page transitions, and skeleton loading states.

## Tech Stack

| Layer      | Tools                                             |
| ---------- | ------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind v4 |
| Backend    | Express 5, TypeScript, Prisma ORM                 |
| Database   | PostgreSQL                                        |
| Auth       | JWT, bcryptjs, httpOnly cookies                   |
| Email      | Resend                                            |
| PWA        | next-pwa                                          |
| Deployment | Vercel (frontend) + Railway (API + database)      |

## App Structure

```text
web/                         Next.js frontend
  app/
    (auth)/                  Login, register, forgot/reset password, email verification
    (app)/
      dashboard/             List overview with item counts and roles
      lists/[id]/            List detail — items, members, settings, themes
      invites/               Sent and received invite management
      settings/              Profile, email, password, danger zone
    components/              Shared UI — alerts, avatars, dialogs, selects
    contexts/                Auth context with token refresh
    lib/api.ts               Typed API client
    manifest.ts              PWA manifest
    globals.css              Design tokens and per-theme CSS variable overrides

api/                         Express backend
  src/
    controllers/             Route handlers
    services/                Business logic
    routes/                  Express routers
    middleware/              Auth, rate limiting
    prisma/
      schema.prisma          Data model
      seed.ts                Dev seed — 10 users, 91 lists, 3000+ items
```

## Core Routes

| Route              | Purpose                                |
| ------------------ | -------------------------------------- |
| `/login`           | Sign in                                |
| `/register`        | Create account                         |
| `/forgot-password` | Request password reset                 |
| `/reset-password`  | Set new password via token             |
| `/verify-email`    | Email verification via token           |
| `/dashboard`       | All lists with item counts and roles   |
| `/lists/:id`       | List detail — items, members, settings |
| `/invites`         | Manage sent and received invites       |
| `/settings`        | Account settings and danger zone       |

## Ownership

LystMate is a personal project by **Dimitrios Spyridon Karampelas**.

Third-party packages, services, icons, and platform tools remain the property of their respective owners and are used through their own licenses or terms.
