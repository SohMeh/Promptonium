# OAuth Setup

OAuth sign-in is fully wired in the app. The login/signup buttons appear
automatically as soon as a provider's credentials exist in `.env` — no code
changes needed. Until then the buttons stay hidden and email/password works
on its own.

For each provider you enable, users who sign in with it are treated as
email-verified automatically.

Set `NEXTAUTH_URL` to your app's public URL (currently `http://localhost:3000`).
All callback URLs below use that base URL.

## Google

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a project (or pick one), then **Create Credentials → OAuth client ID**.
3. Configure the consent screen if prompted (External, app name "Promptonium").
4. Application type: **Web application**.
5. Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (add your production URL variant when you deploy)
6. Copy the client ID and secret into `.env`:
   ```
   AUTH_GOOGLE_ID=<client id>
   AUTH_GOOGLE_SECRET=<client secret>
   ```

## GitHub

1. Go to https://github.com/settings/developers → **New OAuth App**.
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL:
   ```
   http://localhost:3000/api/auth/callback/github
   ```
4. Register, then generate a client secret and add to `.env`:
   ```
   AUTH_GITHUB_ID=<client id>
   AUTH_GITHUB_SECRET=<client secret>
   ```

## Facebook

1. Go to https://developers.facebook.com/apps → **Create App** (type: Consumer).
2. Add the **Facebook Login** product.
3. Valid OAuth Redirect URI:
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
   (Facebook requires HTTPS in production; localhost is allowed in dev mode)
4. Add to `.env`:
   ```
   AUTH_FACEBOOK_ID=<app id>
   AUTH_FACEBOOK_SECRET=<app secret>
   ```

## After adding credentials

Restart the dev server. Verify the buttons appear on `/login`, then check
`http://localhost:3000/api/auth/providers` lists the provider.
