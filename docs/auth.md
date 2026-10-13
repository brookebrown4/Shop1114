# Auth

Auth.js v5 (`next-auth@5.0.0-beta.32`) with a Credentials provider and a
Prisma adapter. Sessions are JWTs (required for Credentials to work even with
an adapter present). Two roles: `"customer"` (default) and `"admin"`.

## Key files

- `lib/auth.ts` — `NextAuth({...})` config: `PrismaAdapter(db)`, `session: {strategy: "jwt"}`, the Credentials provider (email/password checked via `bcrypt.compare` against `User.passwordHash`), and `jwt`/`session` callbacks that copy `id`/`role` onto the token/session
- `lib/auth-guards.ts` — `requireUser()` and `requireAdmin()`: the real authorization gate. Both read the session via a `cache()`-wrapped `getSession()`, redirect to `/sign-in` if there's no user, and `requireAdmin()` additionally redirects non-admins to `/`. Every admin server action calls `requireAdmin()` as its first line — this is what actually protects mutations, not just the route-level check below.
- `proxy.ts` (project root — Next 16 renamed `middleware.ts` to `proxy.ts`) — wraps `auth()`, redirects unauthenticated visitors away from `/account/**` and `/admin/**` (with `callbackUrl` set to the original path), and non-admins away from `/admin/**`. `matcher: ["/account/:path*", "/admin/:path*"]` — `/checkout` is deliberately excluded since guest checkout is supported.
- `app/(auth)/layout.tsx`, `sign-in/{page,actions}.tsx`, `sign-up/{page,actions}.tsx` — centered auth shell; sign-up has no Auth.js built-in, so it hashes the password itself and calls `signIn()` after creating the `User` row (`role: "customer"`)
- `components/auth/sign-in-form.tsx`, `sign-up-form.tsx` — `useActionState` + a hidden `callbackUrl` field
- `components/layout/user-nav.tsx` — `useSession()`; shows a sign-in link when logged out, else an avatar menu (Account/Orders, Admin link if `role === "admin"`, Sign out)
- `app/api/auth/[...nextauth]/route.ts` — re-exports `{GET, POST} = handlers`
- `lib/validations/auth.ts` — sign-in/sign-up Zod schemas
- `types/next-auth.d.ts` — module augmentation adding `id`/`role` to `Session`/`JWT`. **Important**: this augments `@auth/core/types` and `@auth/core/jwt`, not `next-auth`/`next-auth/jwt` — the latter only re-export from `@auth/core` and augmenting them has no effect.

## Data model

`User` (`role` field, `passwordHash`), plus the standard Auth.js adapter tables `Account`, `Session`, `VerificationToken` — none of the OAuth-specific `Account` fields are actually used since the only provider is Credentials.

## Known gaps

- The JWT `callback` only copies `role` onto the token at initial sign-in and never re-reads it from the database on later requests. If an admin's role is changed directly in the DB, both `proxy.ts` and `requireAdmin()` keep trusting the stale token's `role: "admin"` until the user logs out/in or the token naturally expires.
- `proxy.ts` and `lib/auth-guards.ts` each implement their own `role !== "admin"` check rather than sharing one predicate — a future role change (e.g. adding a "staff" role) has to be applied in both places by hand.
- `requireUser()`/`requireAdmin()` redirect to a bare `/sign-in` with no `callbackUrl`, unlike `proxy.ts`'s equivalent redirects — only matters for a code path that reaches these guards without first passing through `proxy.ts`'s matcher.
