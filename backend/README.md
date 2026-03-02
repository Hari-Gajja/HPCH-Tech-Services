# HPCH Tech – Backend (Google OAuth)

Express.js backend that handles Google Authentication for the portfolio site.

## Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - Your production frontend URL
7. Add Authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production frontend URL
8. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Edit `backend/.env`:

```
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
JWT_SECRET=<a-long-random-string>
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Edit `frontend/.env`:

```
VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000
```

> Both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` must have the **same** value.

### 3. Install & Run

```bash
# Backend
cd backend
npm install
npm run dev      # starts on http://localhost:5000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

## API Endpoints

| Method | Path              | Description                        |
|--------|-------------------|------------------------------------|
| POST   | `/api/auth/google` | Exchange Google credential for JWT |
| GET    | `/api/auth/me`     | Check current session              |
| POST   | `/api/auth/logout` | Clear session cookie               |
| GET    | `/api/health`      | Health check                       |

## How It Works

1. User visits the site → frontend shows **Login Page** with Google Sign-In button.
2. Google returns an ID token (credential) → frontend sends it to `POST /api/auth/google`.
3. Backend verifies the token with Google, creates a JWT, and sets it as an `httpOnly` cookie.
4. All subsequent requests include the cookie → `GET /api/auth/me` returns user info.
5. On logout, the cookie is cleared.
