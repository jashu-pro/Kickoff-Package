# Production Deployment Guide

This guide outlines how to deploy the Kickoff application to production environments. The architecture uses Vercel for the React frontend and Render for the Node.js backend.

## 1. Prerequisites
- A GitHub repository containing the monorepo.
- A Vercel account linked to GitHub.
- A Render account linked to GitHub.
- A Supabase project set up with the provided SQL migrations.

## 2. Deploying the Backend (Render)

We use Render's "Blueprint" feature (`render.yaml`) for Infrastructure-as-Code.

1. Go to your Render Dashboard.
2. Click **New > Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and configure the `kickoff-backend` service.
5. In the Render Dashboard for the newly created service, navigate to the **Environment** tab.
6. Provide the required environment variables (see `environment.md`).
7. Trigger a manual deploy if necessary.

**Verification:** Once deployed, visit `https://<your-render-url>/health`. You should see `{"status":"ok"}`.

## 3. Deploying the Frontend (Vercel)

Vercel provides a seamless experience for Vite/React apps.

1. Go to your Vercel Dashboard and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the Project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add the required variables (see `environment.md`).
5. Ensure `VITE_API_URL` points to your newly deployed Render backend URL (e.g., `https://kickoff-backend.onrender.com/api`).
6. Click **Deploy**.

## 4. Supabase Setup for Production

1. Create a new Supabase Project.
2. Run the `supabase_schema.md` and `supabase_auth_schema.md` SQL scripts in the SQL Editor.
3. Run the `supabase_strict_rls.sql.md` script to enforce strict Row Level Security.
4. Update your Frontend and Backend environment variables with the new Production Supabase URL and Keys.
