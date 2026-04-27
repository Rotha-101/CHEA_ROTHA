# Portfolio CMS - Startup Guide

## Problem: Data Lost After Restart

Your app has **two separate servers** that must run together:
- **Frontend**: React on `localhost:5173` 
- **Backend**: Express on `localhost:3001` (manages the database)

If only the frontend runs, the API calls fail and data can't be saved.

## Solution: Run Both Servers

### Quick Start (Recommended)

Open terminal in your project and run:

```bash
npm run dev:full
```

This command starts **both** the frontend and backend at the same time.

### Alternative: Run in Separate Terminals

If `dev:full` doesn't work:

**Terminal 1** (Backend):
```bash
npm run dev:server
```

**Terminal 2** (Frontend):
```bash
npm run dev
```

## Verify Setup is Working

1. Open browser to `http://localhost:5173`
2. Look for **green "Backend Connected"** indicator in bottom-right corner
   - Green = ✅ Both servers running
   - Red = ❌ Backend not responding
3. Create/edit profile data in admin panel (`/admin`)
4. Data should persist after page refresh or restart

## How Data is Stored

- **Database file**: `db.json` (created automatically in project root)
- **Uploaded files**: `uploads/` folder
- **Both persist to disk** - data survives server restarts

## Troubleshooting

### "Backend Offline" red indicator?
1. Check if backend server started in terminal
2. Confirm `npm run dev:full` is running
3. Try restarting: `Ctrl+C` then `npm run dev:full` again

### Port conflicts?
- If port 3001 is in use, you'll see an error in terminal
- Either close the other process or change the port in `server.mjs`

### Missing `db.json`?
- It creates automatically on first backend start
- If missing, restart with `npm run dev:full`

## What NOT to do

❌ Don't run only `npm run dev` (frontend only)
❌ Don't close the backend terminal before stopping the dev server
❌ Don't manually delete `db.json` unless resetting the database

---

**That's it!** Your data will now persist across sessions.
