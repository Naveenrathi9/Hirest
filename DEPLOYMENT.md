# HIREST - Deployment & Hosting Guide

The production build has been generated in the **`build/`** folder:
- **Project Directory**: `C:\Users\DELL\.gemini\antigravity\scratch\hirest`
- **Build Folder**: `C:\Users\DELL\.gemini\antigravity\scratch\hirest\build`
- **Standalone Package**: `C:\Users\DELL\.gemini\antigravity\scratch\hirest\build\standalone`

---

## Option 1: Host on Vercel (Recommended & Easiest)
Next.js was built by Vercel and offers 1-click zero-configuration deployment:
1. Push your repository to GitHub or GitLab.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **Deploy**. Vercel will automatically build and assign a free production URL (e.g., `hirest.vercel.app`) with global CDN, SSL, and serverless APIs.

---

## Option 2: Host on Render, Railway, or VPS (Node.js Server)
The build includes a self-contained **standalone** package with minimal dependencies, pre-compiled static chunks, and assets:

### Step 1: Environment Variables
Ensure your hosting provider or `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

### Step 2: Start Command
To start the production server:
```bash
npm start
```
*(Runs `node build/standalone/server.js` directly)*

Or directly with Node:
```bash
node build/standalone/server.js
```

---

## Option 3: Docker Deployment
Use this simple `Dockerfile` to deploy anywhere (AWS, Google Cloud Run, Azure, DigitalOcean):

```dockerfile
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build
COPY build/standalone ./
COPY build/static ./build/static
COPY public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Available NPM Scripts
- `npm run build`: Minifies Tailwind CSS and generates the full production `build/` folder and standalone package.
- `npm start`: Runs the optimized production server (`http://localhost:3000`).
- `npm run dev`: Starts local development mode.
