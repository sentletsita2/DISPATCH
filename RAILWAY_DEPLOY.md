# Deploying DISPATCH to Railway

## Prerequisites
- Railway account at railway.app
- GitHub repo pushed with all these changes

---

## Step 1 — Create a new Railway project

1. Go to railway.app → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `DISPATCH` repository
4. Railway will detect the `railway.json` and start building

---

## Step 2 — Add a MySQL database

1. In your Railway project dashboard, click **+ New**
2. Choose **Database → MySQL**
3. Wait for it to provision (takes ~30 seconds)
4. Click the MySQL service → **Variables** tab
5. Copy the `DATABASE_URL` value

---

## Step 3 — Set environment variables on the backend service

Click your **backend service** → **Variables** tab → add these:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Paste from MySQL service above |
| `JWT_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and paste |
| `JWT_REFRESH_SECRET` | Run the same command again for a different value |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `FRONTEND_URL` | `*` (change to your Vercel URL after frontend is deployed) |
| `BASE_FARE` | `15` |
| `RATE_PER_KM` | `8` |
| `RATE_PER_MIN` | `1.5` |
| `DRIVER_CUT_PERCENT` | `80` |

---

## Step 4 — Trigger a deploy

Railway auto-deploys on every push. If it doesn't start:
- Click your service → **Deployments** → **Deploy** button

Watch the build logs. You should see:
```
🌱 Seeding database…
✅ Seed complete!
```

---

## Step 5 — Get your backend URL

Click your backend service → **Settings** → **Networking** → **Generate Domain**

This gives you a URL like:
```
https://dispatch-production-xxxx.up.railway.app
```

---

## Step 6 — Set VITE_API_URL in the frontend

In your frontend `.env` (or Vercel environment variables):
```
VITE_API_URL=https://dispatch-production-xxxx.up.railway.app
```

Then update `FRONTEND_URL` in your Railway backend variables to your Vercel URL.

---

## Test accounts (created by seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@dispatch.app | Admin@1234 |
| Passenger | thabo@dispatch.app | Pass@1234 |
| Driver | rethabile@dispatch.app | Pass@1234 |

All 7 passengers and 7 drivers use `Pass@1234`.

---

## Troubleshooting

**Build fails on `db:generate`**
→ Make sure `DATABASE_URL` is set before the build runs. In Railway, set variables before triggering a deploy.

**`npm run db:seed` fails with duplicate key**
→ The seed uses `upsert` so it's safe to run multiple times. If it still fails, check the Railway logs for the specific error.

**CORS errors in browser**
→ Make sure `FRONTEND_URL` in Railway matches your exact frontend URL (no trailing slash).

**`Invalid or expired token` after login**
→ Make sure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and not empty.
