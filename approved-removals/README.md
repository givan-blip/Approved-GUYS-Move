# Approved Removals — live site (Step 1)

This is your removals booking website. Right now it does everything the
prototype did, **plus** it saves real leads and bookings to your Supabase
database. This is the foundation. Stripe payments and owner/driver login
come in the next steps.

There are three services, each doing one job:
- **Cloudflare Pages** — hosts the website (what customers see).
- **Supabase** — stores leads and bookings.
- **Stripe** — takes card payments (added next step).

---

## What you do, in order

### 1. Create the database (Supabase) — 5 minutes
1. Go to supabase.com and open a project (reuse an existing one or make a
   new one — a new one is tidier).
2. Left menu → **SQL Editor** → **New query**.
3. Open `supabase_schema.sql` from this folder, copy everything, paste it in,
   press **Run**. You should see "Success". This creates two tables:
   `removal_leads` and `removal_bookings`.
4. Left menu → **Project Settings → API**. Copy two things:
   - **Project URL**
   - **anon public** key

### 2. Put your keys in the project
1. In this folder, copy `.env.example` to a new file called `.env`.
2. Paste your two values in:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

### 3. Run it on your computer first
```
npm install
npm run dev
```
Open the address it prints (usually http://localhost:5173).
- Go through **Book** → enter items → email/phone → pay. A booking should
  appear in Supabase (Table Editor → `removal_bookings`) and in the app's
  **Owner → Jobs** and **Driver** views.
- The email you typed should appear in `removal_leads` and in **Owner → Leads**.

> If you skip the `.env` step, the app still runs but uses demo data only —
> nothing saves. That's expected.

### 4. Put it online (Cloudflare Pages) — same as your other app
1. Push this folder to a new GitHub repo (e.g. `approved-removals`).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**,
   pick the repo.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Settings → Environment variables** → add the SAME two variables from your
   `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) for **Production**
   (and Preview). Without these, the live site won't save anything.
5. Deploy. You'll get a `*.pages.dev` address.

### 5. Your own web address (optional but recommended)
Buy a domain (e.g. `approvedremovals.co.uk`, ~£8/yr — Cloudflare sells them).
In your Pages project → **Custom domains** → add it. Now you can advertise
that link around your city.

---

## Notes
- **Styling** uses the Tailwind CDN (loaded in `index.html`) so there's no
  extra build setup. Perfectly fine to launch with.
- **Distance** is estimated free from UK postcodes (postcodes.io). For exact
  road miles + drive time we can plug in Google Maps later.
- **Security:** Step 1 uses simple database rules so we can get moving. Before
  you promote the site widely, we'll add an owner/driver login so customer
  details aren't readable by the public key. The SQL file has the stricter
  rules ready as a comment.
- **What's not saved yet:** card payments (Stripe) and the driver photos/
  signatures go to proper storage in the next steps. Bookings, inventory,
  extras and leads DO save now.

Send me a screenshot if anything errors on `npm run dev` or on the Cloudflare
build and I'll sort it.
