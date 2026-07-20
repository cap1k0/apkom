# my-workspace

A two-app monorepo:

- `apps/web` — public site: news/article landing page, user auth (magic link →
  forced username/password setup → password login), Privacy Policy / Terms pages.
- `apps/admin` — separate app, meant for its own subdomain (e.g. `admin.example.com`).
  Only accounts with `is_admin = true` can use it. Manages articles, image uploads
  (via Supabase Storage, which is CDN-backed), and the Privacy/Terms page content.
- `libs/shared-supabase` — shared Supabase client/server helpers used by both apps.

Both apps talk to the **same Supabase project** — that's what keeps them "connected":
content written from `admin` lands in the same tables `web` reads from.

## 1. Supabase setup

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. After it runs, go to Table Editor → `profiles`, find your own row
   (created automatically after your first sign-up), and set `is_admin = true`.
4. Enable Email OTP (magic link) in Authentication → Providers (on by default).

## 2. Environment variables

Copy the example env files and fill in your Supabase project URL/anon key:

```bash
cp apps/web/.env.local.example apps/web/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
```

`apps/web/.env.local` additionally needs Cloudflare Turnstile keys
(free at dash.cloudflare.com → Turnstile) for the magic-link captcha.

## 3. Install & run

```bash
npm install

# in separate terminals:
npm run dev:web     # http://localhost:3000
npm run dev:admin   # http://localhost:3001
```

## 4. Deploy (Vercel, two separate projects from the same repo)

```bash
vercel --cwd apps/web      # set Root Directory: apps/web   → example.com
vercel --cwd apps/admin    # set Root Directory: apps/admin → admin.example.com
```

Add the matching env vars in each Vercel project's settings, then attach:
- `web` project → your main domain
- `admin` project → your admin subdomain

## Notes

- `npx create-nx-workspace` normally works fine locally — it hit an environment-specific
  error in this sandbox (an internal `ts.readConfigFile` mismatch), so this scaffold
  was assembled by hand as a plain npm-workspaces monorepo instead. It's structured
  identically to what Nx would have generated (`apps/*`, `libs/*`) and you can layer
  Nx's task-running on top later with `npx nx init` if you want its caching/graph features —
  it isn't required for the apps to build, run, or deploy.
- Image uploads go to Supabase Storage's `media` bucket, which is served through
  Supabase's built-in CDN (backed by Cloudflare) — no separate CDN wiring needed
  unless you want to front it with your own (e.g. Cloudflare R2 / Bunny).
