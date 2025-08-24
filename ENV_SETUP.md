# Environment Variables Setup Guide

## Problem Fixed

The user authentication issue where existing users couldn't see their avatar and credits in the header has been resolved.

## Root Cause

Missing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in the client-side code.

## Solution

1. **Added required environment variables** to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (for client-side Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for client-side Supabase)

2. **Improved error handling** in `src/app/api/sync-user/route.ts`
   - Better error logging for debugging
   - Proper UUID format validation

3. **Fixed authentication flow**:
   - Client-side Supabase now properly initializes
   - User sessions are correctly retrieved
   - User state and credits display correctly in header

## Environment Variables Needed

Create a `.env.local` file with:

```env
# Supabase Configuration (Client-side - REQUIRED)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Supabase Configuration (Server-side)
SUPABASE_URL="your_supabase_url_here"
SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_SECRET="your_supabase_service_secret_here"

# Other API Keys
HF_API_TOKEN="your_hugging_face_token"
REPLICATE_API_TOKEN="your_replicate_token"
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
PAYPAL_ENVIRONMENT="sandbox"
PAYPAL_WEBHOOK_ID="your_paypal_webhook_id"
VERCEL_OIDC_TOKEN="your_vercel_oidc_token"
```

## Important Notes

- `.env.local` is gitignored for security
- Never commit actual secrets to version control
- Client-side code requires `NEXT_PUBLIC_` prefix
- Server-side code uses regular environment variables

## Authentication Flow

1. User clicks "Sign in" → Google OAuth
2. Callback route (`/auth/callback`) creates/updates user
3. User context provider fetches session and user data
4. Header displays user avatar and credits correctly