# GameZM Local Server Setup Guide 🚀

Follow these quick steps to run **GameZM** on your local machine.

---

## 🛠️ Prerequisites

- **Node.js**: Version **18+** or **20+** installed on your system. ([Download Node.js](https://nodejs.org/))
- **npm**: Included automatically with Node.js.

---

## 🚀 How to Run Locally

### 1️⃣ Install Dependencies

Open your terminal in the project root folder and run:

```bash
npm install
```

> **Note on Native SQLite (`better-sqlite3`):**
> If you see a native module compilation warning or error during `npm install`, run:
> ```bash
> npm rebuild better-sqlite3
> ```

---

### 2️⃣ Start Development Server

Run the following command to start the full-stack server (Express backend + Vite frontend + WebSocket live scoring):

```bash
npm run dev
```

The application will launch automatically at:
👉 **`http://localhost:3000`**

*(If port 3000 is already in use by another app, you can change it by running: `PORT=3001 npm run dev` or on Windows CMD: `set PORT=3001 && npm run dev`)*

---

### 3️⃣ Production Build & Start (Optional)

To test a production-ready build locally:

```bash
# Build the Vite frontend and bundle server.ts with esbuild
npm run build

# Start the compiled production server
npm start
```

---

## 🔑 Default Credentials & Features

- **Admin Account**:
  - **User Name**: `GmaneZM`
  - **Password**: `GameZm2026`
- **Database**: Uses local SQLite database (`tournament.db`), auto-initialized on first launch.
- **Real-Time WebSockets & Polling Fallback**: Active for live score updates and auction updates.

---

## ⚡ Deployment to Vercel (Step-by-Step)

The project is fully pre-configured for one-click deployment to **Vercel** with zero errors!

### Method 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment with serverless API"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** ➔ **"Project"**.
   - Select your GitHub repository.
   - Vercel automatically detects the configuration:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Click **"Deploy"**.

3. **All Done!**
   - The frontend is served via Vercel Edge CDN with SPA client-side routing.
   - The backend API is automatically powered by Vercel Serverless Functions (`api/index.ts`).
   - All routes (`/api/*`) and SPA pages (`/tournaments`, `/admin`, etc.) work without 404 or 500 errors.

### Method 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Deploy to preview
vercel

# 3. Deploy to production
vercel --prod
```

### ⚙️ Vercel Architecture Highlights
- **`vercel.json`**: Pre-configures automatic URL rewriting for all `/api/*` endpoints to the serverless function and single-page-app routing to `/index.html`.
- **`api/index.ts`**: Serverless entrypoint exporting the Express application handler.
- **Serverless SQLite**: On Vercel, the database is seamlessly initialized in `/tmp/tournament.db` with automated seed copying from `tournament.db`.
- **WebSocket Resilience**: Built-in polling fallback ensures match scoring, auctions, and chat continue updating in real-time even on serverless environments where WebSockets are closed.

