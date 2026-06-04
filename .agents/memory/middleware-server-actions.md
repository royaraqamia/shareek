---
name: Middleware + Server Actions
description: Next.js middleware must not redirect Server Action POST requests.
---

## Rule
When protecting routes in `middleware.ts`, always exempt requests with the `next-action` header:

```typescript
const isServerAction = !!request.headers.get('next-action')
if (!user && !isPublic && !isServerAction) {
  // redirect to login
}
```

**Why:** Next.js Server Actions send a POST to the current page URL with `next-action: <id>` header. If middleware redirects this to `/auth/login`, the client receives HTML instead of a Server Action response and throws "An unexpected response was received from the server." Server Actions are already protected at the action level via `getApprovedUser()`.

**How to apply:** Every time `middleware.ts` is written or edited for a Next.js + Supabase project.
