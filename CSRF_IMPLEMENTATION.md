# CSRF Protection Implementation Summary

## Changes Made

### Backend Changes

#### 1. **Server/controllers/authcontroller.js**
- Changed CSRF cookie name from `csrfToken` to `XSRF-TOKEN` (Axios standard)
- This allows Axios to automatically detect and use the token

#### 2. **Server/middleware/protectedRoute.js**
- Updated CSRF validation to check for `XSRF-TOKEN` cookie (was `csrfToken`)
- Updated header validation to check for `x-xsrf-token` header (was `x-csrf-token`)
- Maintains double-submit cookie pattern for security

#### 3. **Server/routes/auth.js**
- Added new `GET /api/auth/csrf-token` endpoint
- Returns existing XSRF-TOKEN or generates a new one
- Useful for verifying token availability and debugging

#### 4. **Server/index.js**
- Updated CORS configuration:
  - Changed `allowedHeaders` from `X-CSRF-Token` to `X-XSRF-TOKEN`
  - Added `XSRF-TOKEN` to `exposedHeaders` for cookie visibility

### Frontend Changes

#### 5. **Client/src/api/axiosConfig.js**
- **Removed** manual cookie reading and request interceptor
- **Added** Axios built-in CSRF support:
  - `withXSRFToken: true` - Auto-read cookie and send header
  - `xsrfCookieName: 'XSRF-TOKEN'` - Cookie to read
  - `xsrfHeaderName: 'X-XSRF-TOKEN'` - Header to send
- **Added** `fetchCsrfToken()` helper function for token verification

#### 6. **Client/src/pages/Login.jsx**
- Import `fetchCsrfToken` helper
- Call `fetchCsrfToken()` after successful login
- Added error handling (non-blocking if fetch fails)

#### 7. **Client/src/pages/Signup.jsx**
- Import `fetchCsrfToken` helper
- Call `fetchCsrfToken()` after successful signup
- Added error handling (non-blocking if fetch fails)

## How It Works

### Login/Signup Flow
```
1. User submits credentials
2. Server validates and creates session
3. Server sets two cookies:
   - sid (httpOnly, contains JWT)
   - XSRF-TOKEN (readable by JS, contains CSRF token)
4. Frontend calls fetchCsrfToken() to verify token availability
5. User is redirected to dashboard
```

### Protected Request Flow
```
1. User makes POST/PUT/DELETE request
2. Axios automatically:
   - Reads XSRF-TOKEN cookie
   - Adds X-XSRF-TOKEN header with token value
3. Server middleware validates:
   - Header token === Cookie token
4. Request proceeds if valid, returns 403 if invalid
```

## Cookie Configuration

| Property | Value | Purpose |
|----------|-------|---------|
| Name | `XSRF-TOKEN` | Axios standard for auto-detection |
| httpOnly | `false` | Must be readable by JavaScript |
| secure | `true` (production) | HTTPS-only for security |
| sameSite | `'none'` (production) | Allow cross-origin (Vercel → Render) |
| maxAge | `86400000` (24h) | Match JWT expiry |

## Testing Checklist

- [ ] Login works without CSRF errors
- [ ] Signup works without CSRF errors
- [ ] POST /api/notes returns 200/201 (not 403)
- [ ] POST /api/tasks returns 200/201 (not 403)
- [ ] POST /api/calendar returns 200/201 (not 403)
- [ ] POST /api/groups returns 200/201 (not 403)
- [ ] XSRF-TOKEN cookie visible in browser DevTools
- [ ] X-XSRF-TOKEN header present in request headers
- [ ] GET /api/auth/csrf-token returns token

## Debugging

If you still see 403 errors:

1. **Check cookies in DevTools:**
   ```
   Application → Cookies → https://study-buddy-lilac-omega.vercel.app
   Should see: XSRF-TOKEN (not httpOnly)
   ```

2. **Check request headers:**
   ```
   Network → Select failed request → Headers
   Should see: X-XSRF-TOKEN: <token-value>
   ```

3. **Verify CORS:**
   ```
   Response headers should include:
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Origin: https://study-buddy-lilac-omega.vercel.app
   ```

4. **Test CSRF endpoint:**
   ```bash
   curl -X GET https://study-buddy-website.onrender.com/api/auth/csrf-token \
     -H "Origin: https://study-buddy-lilac-omega.vercel.app" \
     --cookie-jar cookies.txt \
     --cookie cookies.txt
   ```

## Security Notes

- ✅ Double-submit cookie pattern prevents CSRF attacks
- ✅ httpOnly JWT prevents XSS token theft
- ✅ Secure + SameSite=none required for cross-origin
- ✅ Auth routes excluded from CSRF validation (login/signup)
- ✅ CSRF only validated for state-changing methods (POST/PUT/DELETE/PATCH)