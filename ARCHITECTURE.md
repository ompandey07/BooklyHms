# BookLy HMS Authentication System - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                      (HTML/CSS/JavaScript)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │   LOGIN PAGE     │      │ REGISTRATION PAGE│                │
│  │  - Email Input   │      │  - Email Input   │                │
│  │  - Password      │      │  - Password      │                │
│  │  - Validation    │      │  - Strength Meter│                │
│  │  - Loading State │      │  - Requirements  │                │
│  └────────────┬─────┘      └─────────┬────────┘                │
│               │ POST                  │ POST                    │
│               │ /auth/api/login/      │ /auth/api/register/    │
│               └─────────────┬─────────┘                         │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────┐       │
│  │ localStorage {access_token, refresh_token}         │       │
│  └──────────────────────────┬──────────────────────────┘       │
│                             │                                   │
│               ┌─────────────▼──────────────┐                   │
│               │    DASHBOARD PAGE         │                   │
│               │ - User Profile Display    │                   │
│               │ - Navigation Sidebar      │                   │
│               │ - Statistics Cards        │                   │
│               │ - Logout Button           │                   │
│               └─────────────┬──────────────┘                   │
│                             │                                   │
│                             │ GET /auth/api/dashboard/        │
│                             │ (with JWT Bearer token)         │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  API GATEWAY       │
                    │ CSRF Validation    │
                    │ Request Logging    │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER (Django)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ROUTING LAYER                        │   │
│  │              (accounts/routes.py)                       │   │
│  │                                                         │   │
│  │  POST /auth/api/login/      → login_api()             │   │
│  │  POST /auth/api/register/   → create_user_api()       │   │
│  │  POST /auth/api/logout/     → logout_api()            │   │
│  │  GET  /auth/api/dashboard/  → dashboard_api()         │   │
│  │  GET  /auth/login/          → login_view()            │   │
│  │  GET  /auth/dashboard/      → dashboard_view()        │   │
│  │                                                         │   │
│  └───────────────┬──────────────────────────────────────┬─┘   │
│                  │                                        │     │
│  ┌───────────────▼────────────────┐   ┌────────────────▼──┐   │
│  │   AUTHENTICATION LAYER         │   │  MIDDLEWARE      │   │
│  │   (accounts/views.py)          │   │ ────────────────  │   │
│  │                                │   │ JWT Validation   │   │
│  │ • login_api()                  │   │ CSRF Protection  │   │
│  │ • create_user_api()            │   │ Rate Limiting    │   │
│  │ • logout_api()                 │   │ Logging          │   │
│  │ • dashboard_api()              │   │                  │   │
│  │                                │   │                  │   │
│  └───────────┬──────────────┬─────┘   └────────────┬─────┘   │
│              │              │                      │           │
│  ┌───────────▼┐ ┌───────────▼────┐  ┌──────────┬──▼────┐     │
│  │ AUTH UTILS │ │ RATE LIMITER   │  │ JWT      │CACHE  │     │
│  │────────────│ │────────────────│  │ DECORATOR│       │     │
│  │ • Pass     │ │ • Failed       │  │ • Token  │ Store │     │
│  │   Validate │ │   attempts     │  │   Verify │ Rate  │     │
│  │ • Email    │ │ • Lockout      │  │ • User   │ Limit │     │
│  │   Validate │ │   timer        │  │   Extract│       │     │
│  │ • Token    │ │ • Unlock       │  │          │       │     │
│  │   Generate │ │   check        │  │          │       │     │
│  │            │ │                │  │          │       │     │
│  └────────────┘ └────────────────┘  └──────────┴───────┘     │
│       │                │                    │                 │
│       └────────────────┼────────────────────┘                 │
│                        │                                      │
│             ┌──────────▼──────────┐                          │
│             │  DATABASE LAYER     │                          │
│             │ ──────────────────  │                          │
│             │ PostgreSQL          │                          │
│             │                     │                          │
│             │ Users Table:        │                          │
│             │ • id (pk)           │                          │
│             │ • username          │                          │
│             │ • email             │                          │
│             │ • password (hashed) │                          │
│             │ • date_joined       │                          │
│             │ • is_active         │                          │
│             │                     │                          │
│             └─────────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow Diagram

### Registration Flow

```
┌─────────────┐
│  User Input │
│  Email/Pass │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Frontend Validation  │
│ • Email format       │
│ • Password strength  │
│ • Matching confirm   │
└──────┬───────────────┘
       │
       ▼ POST /auth/api/register/
┌──────────────────────┐
│ Backend Validation   │
│ • Email regex        │
│ • Password check     │
│ • Duplicate email    │
└──────┬───────────────┘
       │
       ▼ (Success)
┌──────────────────────┐
│ Hash Password        │
│ (PBKDF2 + SHA256)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create User          │
│ Generate Username    │
│ Save to Database     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Generate JWT Tokens  │
│ • Access: 24hr       │
│ • Refresh: 7 days    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Return Tokens        │
│ Store in localStorage│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Redirect to          │
│ Dashboard            │
└──────────────────────┘
```

### Login Flow

```
┌──────────────────────┐
│  Enter Credentials   │
│  Email + Password    │
└──────┬───────────────┘
       │
       ▼ POST /auth/api/login/
┌──────────────────────────────┐
│ Rate Limit Check             │
│ Is account locked?           │
└──────┬───────────┬────────────┘
       │ (locked)  │ (not locked)
       │           ▼
       │    ┌──────────────────────────┐
       │    │ Find User by Email       │
       │    │ Check in Database        │
       │    └──────┬───────────────────┘
       │           │
       │           ▼ (User exists?)
       │    ┌──────────────────────────┐
       │    │ Authenticate             │
       │    │ Compare Passwords        │
       │    │ (Constant-time compare)  │
       │    └──────┬────────┬───────────┘
       │           │        │ (Wrong)
       │           │        ▼
       │           │    ┌──────────────────────────┐
       │           │    │ Increment Failed Count   │
       │           │    │ Check if ≥ 5            │
       │           │    └──────┬───────────────────┘
       │           │           │
       │           │           ▼ (≥ 5?)
       │           │    ┌──────────────────────────┐
       │           │    │ Lock Account             │
       │           │    │ Set 5-min Lockout        │
       │           │    └──────┬───────────────────┘
       │           │           │
       │           │           ▼
       │           │    Return 429 (Locked)
       │           │
       │           ▼ (Correct)
       │    ┌──────────────────────────┐
       │    │ Reset Failed Count       │
       │    │ Generate JWT Tokens      │
       │    │ • access_token           │
       │    │ • refresh_token          │
       │    └──────┬───────────────────┘
       │           │
       │           ▼
       │    ┌──────────────────────────┐
       │    │ Return Tokens & User     │
       │    │ HTTP 200 (Success)       │
       │    └──────┬───────────────────┘
       │           │
       ▼           ▼
┌──────────────────────────────┐
│ Display Error Message        │
│ OR                           │
│ Store Tokens in localStorage │
│ Redirect to Dashboard        │
└──────────────────────────────┘
```

### Dashboard Access Flow

```
┌─────────────────────────────┐
│ Navigate to Dashboard       │
│ /auth/dashboard/            │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Frontend JavaScript Initializes      │
│ Check localStorage for tokens        │
└──────┬─────────┬────────────────────┘
       │         │
   (No Token)    │ (Has Token)
       │         │
   Redirect      ▼
   to Login  ┌──────────────────────────┐
             │ Render Dashboard UI      │
             │ Get User Data from Token │
             └──────┬───────────────────┘
                    │
                    ▼ GET /auth/api/dashboard/
                       (Authorization: Bearer <token>)
             ┌──────────────────────────┐
             │ JWT Authentication       │
             │ Extract token from       │
             │ Authorization header     │
             └──────┬──────────┬────────┘
                    │          │ (Invalid)
                    │ (Valid)   │
                    │           ▼
                    │    Return 401
                    │    Redirect to Login
                    │
                    ▼
             ┌──────────────────────────┐
             │ @jwt_required Decorator  │
             │ Verify token signature   │
             │ Check expiration         │
             └──────┬─────────┬────────┘
                    │         │ (Invalid/Expired)
                    │ (Valid) │
                    │         ▼
                    │    Return 401
                    │    Redirect to Login
                    │
                    ▼
             ┌──────────────────────────┐
             │ Get User Data            │
             │ Fetch from Database      │
             │ Prepare JSON Response    │
             └──────┬───────────────────┘
                    │
                    ▼
             ┌──────────────────────────┐
             │ Return HTTP 200          │
             │ + User Data              │
             │ + Dashboard Stats        │
             └──────┬───────────────────┘
                    │
                    ▼
             ┌──────────────────────────┐
             │ Display Dashboard        │
             │ - User Profile           │
             │ - Sidebar Navigation     │
             │ - Statistics Cards       │
             │ - Logout Button          │
             └──────────────────────────┘
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: Frontend Validation                            │
│ ───────────────────────────────────────────────────────  │
│ • Email format check (regex)                            │
│ • Password strength validation                          │
│ • Required fields check                                 │
│ • Real-time feedback                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 2: Transport Security (HTTPS)                     │
│ ───────────────────────────────────────────────────────  │
│ • SSL/TLS Encryption                                    │
│ • Secure cookie flags                                   │
│ • SameSite attribute                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 3: CSRF Protection                                │
│ ───────────────────────────────────────────────────────  │
│ • CSRF Token generation                                 │
│ • Token validation on POST                              │
│ • Origin checks                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 4: Rate Limiting                                  │
│ ───────────────────────────────────────────────────────  │
│ • Track failed attempts (per email)                     │
│ • Lock account after 5 failures                         │
│ • 5-minute automatic cooldown                           │
│ • Cache-based tracking                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 5: Backend Validation                             │
│ ───────────────────────────────────────────────────────  │
│ • Email format validation (RFC 5322)                    │
│ • Password strength check                               │
│ • Duplicate detection                                   │
│ • Input sanitization                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 6: Authentication                                 │
│ ───────────────────────────────────────────────────────  │
│ • Database user lookup                                  │
│ • Password comparison (constant-time)                   │
│ • Login verification                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 7: Token Generation & Security                    │
│ ───────────────────────────────────────────────────────  │
│ • JWT Tokens (HS256)                                    │
│ • Signed with SECRET_KEY                                │
│ • Access Token: 24-hour expiry                          │
│ • Refresh Token: 7-day expiry                           │
│ • Token rotation support                                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 8: JWT Verification                               │
│ ───────────────────────────────────────────────────────  │
│ • Authorization header check                            │
│ • Token signature verification                          │
│ • Expiration check                                      │
│ • @jwt_required decorator                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 9: Database Security                              │
│ ───────────────────────────────────────────────────────  │
│ • Password hashing (PBKDF2 + SHA256)                    │
│ • SQL injection prevention (Django ORM)                 │
│ • Field-level permissions                               │
│ • Audit logging                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Token Structure

```
ACCESS TOKEN (JWT):
┌─────────────────────────────────────────┐
│ HEADER                                  │
├─────────────────────────────────────────┤
│ {                                       │
│   "alg": "HS256",                       │
│   "typ": "JWT"                          │
│ }                                       │
├─────────────────────────────────────────┤
│ PAYLOAD                                 │
├─────────────────────────────────────────┤
│ {                                       │
│   "token_type": "access",               │
│   "exp": 1713435000,        (24 hours)  │
│   "iat": 1713348600,                    │
│   "jti": "abc123xyz",                   │
│   "user_id": 1,                         │
│   "username": "john_doe",               │
│   "email": "john@example.com"           │
│ }                                       │
├─────────────────────────────────────────┤
│ SIGNATURE (HS256)                       │
├─────────────────────────────────────────┤
│ HMACSHA256(                             │
│   base64url(header) + "." +             │
│   base64url(payload),                   │
│   secret_key                            │
│ )                                       │
└─────────────────────────────────────────┘

REFRESH TOKEN (JWT):
┌─────────────────────────────────────────┐
│ Similar structure but:                  │
│                                         │
│ "token_type": "refresh"                 │
│ "exp": 1713954600           (7 days)    │
│                                         │
│ Used to obtain new access tokens        │
└─────────────────────────────────────────┘
```

---

**System designed for maximum security with user-friendly experience! 🚀**
