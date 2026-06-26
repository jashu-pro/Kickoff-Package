# Environment Variables Configuration

To run the application successfully across environments, configure the following environment variables.

## Frontend (`frontend/.env`)

Required for the Vite React application to communicate with Supabase and the Backend API.

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL (e.g., `https://xxxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Project Anon (Public) Key |
| `VITE_API_URL` | The URL of your Node.js Backend API (e.g., `http://localhost:5000/api` locally, or `https://backend.onrender.com/api` in production) |

## Backend (`backend/.env`)

Required for the Node.js Express server to bypass RLS for administrative actions or webhooks.

| Variable | Description |
|----------|-------------|
| `PORT` | The port the server runs on (defaults to `5000` locally, automatically set by Render in production) |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Project Service Role Key. **CRITICAL: NEVER expose this to the frontend!** |
| `NODE_ENV` | `development` locally, `production` when deployed |
