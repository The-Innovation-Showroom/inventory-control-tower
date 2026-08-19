# Inventory Control Tower — deploy notes

Two changes were made to this app:

1. **The password screen is gone.** It used to ask for a name and `konvergeai`.
   Access is now controlled by the Solution Explorer instead, so the demo opens
   straight onto the Executive Overview.
2. **`middleware.js` was added.** This is Vercel Routing Middleware — it checks
   for a signed token from the Explorer and redirects anyone without one back
   there. It must stay at the root, beside `package.json`.

---

## Deploying

From this folder in PowerShell:

```powershell
vercel login          # sign in as Tejaswini194
vercel --prod
```

Choose your own account when asked for a team, and create a new project.
**Copy the production URL it gives you** — you need it in step 3.

## 2. Add the two variables

```powershell
vercel env add DEMO_LINK_SECRET production
```

Answer `y` to sensitive, then paste the same 64-character secret you set on the
hub. It must match exactly — a trailing space will break it.

```powershell
vercel env add HUB_URL production
```

Answer `n` to sensitive, then paste your Explorer's URL.

Then redeploy so the variables take effect:

```powershell
vercel --prod
```

## 3. Update the hub

Go to your Explorer's `/admin`, click **Edit** on Inventory Control Tower, and:

- Replace **Demo URL** with the new URL from step 1
- **Clear the Demo password field.** The demo no longer asks for `konvergeai`,
  so leaving it there would show clients a password that does nothing.

Save.

## 4. Test

1. Open the Explorer, enter a working email and access code, click **Open Demo**.
   The demo should load straight onto the dashboard — no password screen — and
   the address bar should show the plain URL with no `?kv=` in it.
2. Copy that URL into a private browsing window. You should be redirected to the
   Explorer.

Step 2 is the one that proves it works. The guard fails open by design: if
`DEMO_LINK_SECRET` is missing or mistyped, everyone gets in rather than nobody.
So a demo that looks fine may not actually be protected.

---

## If something is wrong

**Step 1 redirects you instead of loading** — the secrets do not match. Retype
both rather than pasting.

**Step 2 loads the demo anyway** — either `middleware.js` is not at the root
beside `package.json`, or `DEMO_LINK_SECRET` was never set on this project.
Check with `vercel env ls`.

**The old project in Prateek's account** should be deleted once this one works:
open it in the Vercel dashboard, Settings > Delete Project.
