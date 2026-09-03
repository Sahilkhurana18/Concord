# Concord

Offline-first, real-time collaborative notes. Edits apply instantly to a
local CRDT and persist to IndexedDB — there is no "save" button, and no
loading spinner when you open the app offline. Whenever a connection is
available, the local document syncs with collaborators in real time, and
Yjs's conflict-free merge guarantees mean two people editing offline for a
week and reconnecting will merge cleanly with no manual conflict resolution.

## Why this project

Most "collaborative editor" projects wrap a WebSocket around a text field
and call it done. This one is built the way production local-first apps
(Linear, Figma's multiplayer engine) actually work, end to end — real
auth, a real database, a real invite/share flow, not just the editor demo:

- **Offline is not a fallback state, it's the primary state.** The app never
  blocks on the network — IndexedDB is the source of truth locally, and the
  server is just another peer to sync with.
- **CRDTs, not operational transform.** Yjs updates are commutative and
  associative, so merge order never matters — this sidesteps an entire class
  of bugs OT-based editors have to solve with a central sequencing server.
- **Collaboration goes beyond a shared cursor.** Google OAuth sign-in,
  scoped email invites (view vs. edit permission, with acceptance
  tracking), signed & revocable share links, and document export.

## Architecture

```
apps/web       Next.js app — dashboard, doc editor, sign-in, invite pages.
               Tiptap editor bound to a Yjs doc, IndexedDB persistence,
               WebSocket sync, PDF/PNG export. Auth via NextAuth (Google
               OAuth). Issues short-lived signed tokens (/api/token) that
               the client sends to apps/server as an Authorization header.

apps/server    Express + y-websocket sync server. REST API for docs,
               invites (sends email via Resend), and share links (signed,
               revocable JWTs). Verifies requests via the Authorization
               token from apps/web rather than reading any cookie — see
               the interview notes below for why.

packages/db    Prisma schema + client, shared by both apps. Single source
               of truth for Users, Docs, Collaborators, ShareLinks, and
               NextAuth's own session/account tables.

packages/shared  TypeScript types shared between web and server so the
               API contract can't silently drift.
```

**Data flow for an edit:**
1. User types → Tiptap dispatches a transaction → Yjs applies it to the
   in-memory CRDT doc.
2. `y-indexeddb` observes the change and writes it to IndexedDB immediately
   (this is what makes offline work).
3. `y-websocket` observes the change and, if connected, broadcasts the delta
   to the server, which relays it to other connected clients.
4. A reconnecting client exchanges "state vectors" with the server so only
   the missing updates are transferred — not the whole document.

**Data flow for an invite:**
1. Owner submits an email + permission → `POST /api/invite`.
2. Server upserts a `Collaborator` row (`status: "invited"`) and emails a
   link via Resend.
3. Invitee signs in with Google (creating their `User` row if new), opens
   `/invite/:token?doc=...`, and accepts → `Collaborator.status` flips to
   `"accepted"` and the doc appears on their dashboard.

**Data flow for a share link:**
1. Owner clicks "Share link" → `POST /api/share-links` signs a JWT
   encoding `{ docId, permission }` and stores a matching `ShareLink` row
   (so it can be revoked later, independent of JWT expiry).
2. Anyone opening `/doc/:id?token=...` gets read/write access per the
   token's permission — no account required — unless the link has been
   revoked, which the server checks against the DB row on every visit.

## Getting started

```bash
npm install                 # also runs prisma generate (postinstall)
cp .env.example .env        # fill in DATABASE_URL, NEXTAUTH_SECRET,
                             # SHARE_LINK_SECRET, RESEND_API_KEY
npm run db:migrate          # creates tables from packages/db/prisma/schema.prisma
npm run dev                 # sync + API server (:4000) + web app (:3000)
```

Sign in with Google, create a doc, then open
it in a second browser profile signed in as a different user you've
invited. Turn off your network in one tab, keep typing, turn it back on —
your changes merge in without conflict.

### Setting up Google sign-in

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an OAuth 2.0 Client ID (type: Web application).
2. Add `http://localhost:3000/api/auth/callback/google` as an authorized
   redirect URI (swap the domain for your production URL when you deploy).
3. Drop the client ID/secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   in `.env`.

## Feature checklist

- [x] Offline-first editing with IndexedDB persistence
- [x] Real-time multi-cursor sync over WebSocket
- [x] Google OAuth sign-in (via NextAuth)
- [x] Invite collaborators by email (view/edit permission, acceptance flow)
- [x] Shareable view-only links with optional expiry and manual revocation
- [x] Export document as PDF or PNG
- [x] Persistent Postgres storage via Prisma (docs, collaborators, links)
- [x] Delete documents (owner only, from dashboard or the doc page)
- [ ] Version history / time-travel using Yjs's UndoManager
- [ ] Granular block-level permissions

## What to say about this in an interview

- **CRDTs vs. OT**: be ready to explain why Yjs sidesteps the need for a
  central transform server, and the tradeoff (CRDTs can have larger
  metadata overhead for long-lived docs — mention garbage collection via
  `Y.Doc.gc`).
- **The offline reconnection story**: what happens to a queued local edit
  when the client comes back online after another collaborator has made
  conflicting changes — walk through the state-vector exchange.
- **Auth across two servers**: the web app and the API server live on
  different domains in production (Vercel vs Render), and browsers
  increasingly block cookies on cross-site requests by default — even with
  `SameSite=None; Secure` set correctly — as part of third-party cookie
  deprecation (Chrome's `Sec-Fetch-Storage-Access` mechanism). Cookies
  simply aren't reliable across origins anymore. Instead, the web app
  exposes a same-origin `/api/token` endpoint that reads the (same-site)
  session cookie and issues a short-lived signed token, which the client
  sends explicitly as an `Authorization: Bearer` header — a header isn't
  subject to cookie policy at all. Worth discussing this as a concrete,
  current example of a browser privacy change breaking a "working"
  architecture, and why explicit tokens are the more robust pattern for
  any split frontend/backend deployment.
- **Security of share links**: signed JWTs mean verification needs no DB
  round-trip in the common case, but revocation needs a DB check anyway —
  discuss why we check both, and the tradeoff vs. a purely DB-backed token.
