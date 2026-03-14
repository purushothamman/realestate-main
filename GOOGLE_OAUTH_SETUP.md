# Google OAuth Setup Guide — EStateHub App

## Why You Got `Error 401: invalid_client`

Three bugs caused this error:

| # | Bug | Fix Applied |
|---|-----|-------------|
| 1 | Placeholder Client IDs (`YOUR_EXPO_CLIENT_ID`) | Replaced with your real Client ID |
| 2 | `GOOGLE_CLIENT_ID` missing from `backend/.env` | Added to `backend/.env` |
| 3 | Token type mismatch: frontend sent `accessToken`, backend called `verifyIdToken()` (which only accepts `id_token` JWTs) | Fixed — frontend now requests `id_token`, backend handles both types |

---

## ✅ What Has Already Been Fixed (Code Changes)

### Frontend ([`modules/auth/context/GoogleLoginConfig.js`](./modules/auth/context/GoogleLoginConfig.js))
- `WEB_CLIENT_ID` now set to your real Google Client ID

### Frontend ([`modules/auth/screens/LoginScreen.jsx`](./modules/auth/screens/LoginScreen.jsx))
- `useAuthRequest` now uses `webClientId` + `responseType: 'id_token'`
- Token extraction now reads `id_token` first, then falls back to `accessToken`
- Better error messages shown to the user

### Backend ([`backend/.env`](./backend/.env))
- `GOOGLE_CLIENT_ID` now set (removed the duplicate placeholder)

### Backend ([`backend/src/controllers/authControllers.js`](./backend/src/controllers/authControllers.js))
- `googleLogin()` now handles **both** `id_token` (JWT) and `access_token` gracefully
- Path A: `verifyIdToken()` for id_token (cryptographic, fast)
- Path B: Google tokeninfo + userinfo API for access_token (robust fallback)

---

## ⚠️ One Manual Step Remaining: Google Cloud Console Setup

Your Client ID is: `583846474336-e4upcru2iqall7hgkbdo485f11ueehh0.apps.googleusercontent.com`

You need to verify/add the correct **Authorized Redirect URIs** on Google Cloud Console.

### Step 1: Go to your OAuth Client ID
1. Open: https://console.cloud.google.com/apis/credentials
2. Find the Client ID `583846474336-...` (type: Web application)
3. Click the pencil ✏️ edit icon

### Step 2: Add These Redirect URIs

Under **Authorized redirect URIs**, ensure these exist:
```
https://auth.expo.io/@169yami/estatehub-app
```

Under **Authorized JavaScript origins**, ensure this exists:
```
https://auth.expo.io
```

Click **Save**.

> **Why?** The Expo OAuth proxy at `auth.expo.io` handles the redirect back to your app.
> Your Expo owner is `169yami` and your app slug is `estatehub-app` (from `app.json`).

---

## For EAS / Production APK Builds

When building with `eas build`, you also need an **Android OAuth Client ID**:

### Step 1: Get your SHA-1 fingerprint
The `eas credentials` command you've already run will give you the SHA-1.
Look for output like: `SHA1: XX:XX:XX:...`

### Step 2: Create an Android OAuth Client ID
1. In Google Cloud Console → Credentials → **+ CREATE CREDENTIALS** → OAuth client ID
2. Application type: **Android**
3. Package name: `com.example.estatehubapp`
4. SHA-1 certificate fingerprint: (paste from step 1)
5. Click **Create** → Copy the new Client ID

### Step 3: Add it to your config
In [`modules/auth/context/GoogleLoginConfig.js`](./modules/auth/context/GoogleLoginConfig.js):
```javascript
ANDROID_CLIENT_ID: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
```

---

## Testing the Complete Flow

### In Expo Go (Development)
1. Restart backend: `cd backend && node server.js`
2. Check backend console shows: `✅ GOOGLE_CLIENT_ID found: 583846474336-...`
3. Start Expo: `npx expo start` (in project root)
4. Scan QR with Expo Go app
5. Navigate to Login → tap **Google** button
6. Browser opens Google account selector
7. Choose account → redirected back to app
8. Backend console shows: `✅ GOOGLE LOGIN SUCCESS`
9. App navigates to home screen ✅

### Common Errors After This Fix

| Error | Cause | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | Missing redirect URI in Google Console | Add `https://auth.expo.io/@169yami/estatehub-app` |
| `invalid_client` | Wrong Client ID | Double-check `WEB_CLIENT_ID` in `GoogleLoginConfig.js` matches `GOOGLE_CLIENT_ID` in `backend/.env` |
| Token verification fails | id_token audience mismatch | Frontend and backend must use the SAME Web Client ID |
| Browser doesn't open | `expo-web-browser` issue | Ensure `WebBrowser.maybeCompleteAuthSession()` is at top of LoginScreen |

---

## Environment Variables Summary

### `backend/.env`
```env
GOOGLE_CLIENT_ID=583846474336-e4upcru2iqall7hgkbdo485f11ueehh0.apps.googleusercontent.com
```

### `modules/auth/context/GoogleLoginConfig.js`
```javascript
WEB_CLIENT_ID: '583846474336-e4upcru2iqall7hgkbdo485f11ueehh0.apps.googleusercontent.com',
ANDROID_CLIENT_ID: '',  // Fill in after running `eas credentials`
```

> Both `WEB_CLIENT_ID` (frontend) and `GOOGLE_CLIENT_ID` (backend) **must be identical**.
> If they differ, token verification will fail with an audience mismatch error.
