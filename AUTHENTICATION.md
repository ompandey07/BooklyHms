# BookLy HMS - JWT Authentication System

## Overview

This document describes the complete JWT-based authentication system for BookLy Hotel Management System. It includes user registration, login with rate limiting, logout, and a protected dashboard.

---

## Features Implemented

### 1. **User Registration API**

- **Endpoint**: `POST /auth/api/register/`
- **Features**:
  - Email validation
  - Strong password validation (8+ chars, uppercase, lowercase, numbers, special chars)
  - Automatic username generation from email
  - Duplicate email checking
  - Unique username generation with counter

**Example Request**:

```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

**Success Response** (201):

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user_id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  }
}
```

---

### 2. **Login API with Rate Limiting**

- **Endpoint**: `POST /auth/api/login/`
- **Features**:
  - Email + password authentication
  - Rate limiting (5 failed attempts → 5-minute lockout)
  - Remember me option for extended tokens
  - Detailed error messages
  - Success logging with token generation

**Rate Limiting Details**:

- Max Failed Attempts: 5
- Lockout Duration: 5 minutes (300 seconds)
- Attempt Window: 15 minutes

**Example Request**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user_id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  },
  "timestamp": "2026-04-18T10:30:00.000000"
}
```

**Rate Limited Response** (429):

```json
{
  "success": false,
  "message": "Account locked due to too many failed attempts. Please try again in 297 seconds.",
  "locked": true,
  "lockout_time": 297
}
```

**Invalid Credentials Response** (401):

```json
{
  "success": false,
  "message": "Invalid email or password",
  "attempts_remaining": 3,
  "locked": false,
  "lockout_time": 0
}
```

---

### 3. **Logout API**

- **Endpoint**: `POST /auth/api/logout/`
- **Features**:
  - Invalidates refresh token
  - Clears session
  - Secure token blacklisting

**Example Request**:

```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2026-04-18T10:35:00.000000"
}
```

---

### 4. **Dashboard View (Protected)**

- **Endpoint**: `GET /auth/dashboard/`
- **Authorization**: JWT Bearer Token required
- **Features**:
  - Beautiful, responsive dashboard
  - User profile display
  - Refresh data functionality
  - Real-time logout

**Access with JWT Token**:

```
Authorization: Bearer <access_token>
```

---

### 5. **Dashboard API**

- **Endpoint**: `GET /auth/api/dashboard/`
- **Authorization**: JWT Bearer Token required
- **Returns**: User data and dashboard statistics

**Success Response** (200):

```json
{
  "success": true,
  "message": "Welcome to Dashboard",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "date_joined": "2026-04-18T10:00:00.000000"
  },
  "timestamp": "2026-04-18T10:35:00.000000"
}
```

---

### 6. **CSRF Token Endpoint**

- **Endpoint**: `GET /auth/api/csrf-token/`
- **Returns**: CSRF token for form submissions

---

## JWT Token Details

### Access Token

- **Lifetime**: 24 hours
- **Used for**: API requests
- **Header**: `Authorization: Bearer <token>`

### Refresh Token

- **Lifetime**: 7 days
- **Used for**: Obtaining new access tokens
- **Can be**: Rotated for enhanced security

**Token Payload Example**:

```json
{
  "token_type": "access",
  "exp": 1713435000,
  "iat": 1713348600,
  "jti": "abc123xyz",
  "user_id": 1,
  "username": "john_doe",
  "email": "user@example.com"
}
```

---

## Frontend Implementation

### Login/Register Page

- **Location**: `/auth/login/`
- **Features**:
  - Tabs for Login and Register
  - Real-time password strength indicator
  - Password requirements checklist
  - Email format validation
  - Error and success notifications (toasts)
  - Rate limit countdown display
  - Loading spinner with messages

### Dashboard Page

- **Location**: `/auth/dashboard/`
- **Features**:
  - User information display
  - Navigation sidebar
  - Quick action buttons
  - Statistics cards
  - Logout functionality
  - Responsive design

---

## Password Requirements

All passwords must contain:

1. ✓ At least 8 characters
2. ✓ One uppercase letter (A-Z)
3. ✓ One lowercase letter (a-z)
4. ✓ One number (0-9)
5. ✓ One special character (!@#$%^&\*(),.?":{}|<>)

**Example**: `SecurePass123!`

---

## Security Features

### 1. **Rate Limiting**

- Prevents brute force attacks
- 5 failed attempts trigger 5-minute lockout
- Uses Django cache for tracking

### 2. **JWT Authentication**

- Stateless token-based authentication
- No passwords stored in sessions
- Tokens signed with SECRET_KEY
- Refresh token rotation support

### 3. **Email Validation**

- RFC 5322 compliant email format checking
- Duplicate email prevention

### 4. **Password Security**

- Strict password requirements
- Django password hashing (PBKDF2 by default)
- No plaintext passwords in responses

### 5. **CSRF Protection**

- CSRF token validation
- Secure header checks

### 6. **Token Expiration**

- Short-lived access tokens (24 hours)
- Longer refresh tokens (7 days)
- Automatic token refresh support

---

## API Endpoints Summary

| Method | Endpoint                | Auth | Purpose            |
| ------ | ----------------------- | ---- | ------------------ |
| GET    | `/auth/login/`          | -    | Render login page  |
| POST   | `/auth/api/register/`   | -    | Create new user    |
| POST   | `/auth/api/login/`      | -    | Authenticate user  |
| POST   | `/auth/api/logout/`     | JWT  | Logout user        |
| GET    | `/auth/dashboard/`      | JWT  | View dashboard     |
| GET    | `/auth/api/dashboard/`  | JWT  | Get dashboard data |
| GET    | `/auth/api/csrf-token/` | -    | Get CSRF token     |

---

## Testing the System

### 1. **Create a Test User**

```bash
curl -X POST http://localhost:8000/auth/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "username": "testuser"
  }'
```

### 2. **Login**

```bash
curl -X POST http://localhost:8000/auth/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 3. **Access Dashboard**

```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8000/auth/api/dashboard/
```

### 4. **Logout**

```bash
curl -X POST http://localhost:8000/auth/api/logout/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<refresh_token>"
  }'
```

---

## File Structure

```
accounts/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── routes.py              # URL routing
├── views.py               # API views & authentication logic
├── auth_utils.py          # Authentication utilities
├── rate_limiter.py        # Rate limiting functionality
├── decorators.py          # JWT decorators
├── tests.py
└── migrations/

Frontend/
├── accounts/
│   └── login.html         # Login & Register page
└── dashboard/
    └── dashboard.html     # Dashboard page

static/
└── Block/
    └── app.js             # Frontend authentication logic
```

---

## Environment Variables Required

```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=bookly_hms
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

---

## Common Issues & Solutions

### Issue: "Token is invalid or expired"

**Solution**: Get a new access token using the refresh token or login again

### Issue: "Account locked"

**Solution**: Wait 5 minutes for the automatic unlock, or clear cache if in development

### Issue: "Invalid email format"

**Solution**: Use a valid email format (user@domain.com)

### Issue: "Password does not meet requirements"

**Solution**: Ensure password has 8+ chars, uppercase, lowercase, number, and special character

---

## Future Enhancements

- [ ] Email verification on registration
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 social login
- [ ] Password reset via email
- [ ] User role-based access control (RBAC)
- [ ] Activity logging
- [ ] Account recovery options
- [ ] Device-based authentication

---

## Support

For issues, please refer to:

- Django JWT Documentation: https://django-rest-framework-simplejwt.readthedocs.io/
- Django Auth: https://docs.djangoproject.com/en/stable/topics/auth/

---

**System**: BookLy HMS  
**Version**: 1.0.0  
**Last Updated**: April 18, 2026
