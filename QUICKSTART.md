# 🚀 BookLy HMS - Quick Reference Guide

## Quick Links

| What?             | Where?                                  |
| ----------------- | --------------------------------------- |
| **Login Page**    | `http://localhost:8000/auth/login/`     |
| **Dashboard**     | `http://localhost:8000/auth/dashboard/` |
| **Admin Panel**   | `http://localhost:8000/admin/`          |
| **API Register**  | `POST /auth/api/register/`              |
| **API Login**     | `POST /auth/api/login/`                 |
| **API Logout**    | `POST /auth/api/logout/`                |
| **API Dashboard** | `GET /auth/api/dashboard/`              |

---

## Quick Start (Development)

```bash
# 1. Enter project directory
cd "/media/om-pandey/Om Pandey/BooklyHms"

# 2. Run migrations
python3 manage.py migrate

# 3. Create superuser (optional)
python3 manage.py createsuperuser

# 4. Start server
python3 manage.py runserver
```

Visit: `http://localhost:8000/auth/login/`

---

## Test User Credentials

### For Testing

- **Email**: `test@example.com`
- **Password**: `TestPass123!`

### Create Test User via API

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

---

## Password Requirements Checklist

✅ At least **8 characters**  
✅ One **UPPERCASE** letter  
✅ One **lowercase** letter  
✅ One **number** (0-9)  
✅ One **special** character (!@#$%^&\*)

**Example**: `SecurePass123!`

---

## Rate Limiting

- **Max Attempts**: 5 failed logins
- **Lockout Duration**: 5 minutes (300 seconds)
- **Message**: Shows countdown timer
- **Reset**: Automatically after lockout expires or successful login

---

## Token Information

### Access Token

- **Lifetime**: 24 hours
- **Purpose**: API requests
- **Location**: localStorage
- **Usage**: `Authorization: Bearer <token>`

### Refresh Token

- **Lifetime**: 7 days
- **Purpose**: Get new access tokens
- **Usage**: POST to refresh endpoint

---

## File Locations

### Core Files

- Views: `accounts/views.py`
- Routes: `accounts/routes.py`
- Auth Utils: `accounts/auth_utils.py`
- Rate Limiter: `accounts/rate_limiter.py`
- JWT Decorators: `accounts/decorators.py`

### Frontend Files

- Login Page: `Frontend/accounts/login.html`
- Dashboard Page: `Frontend/dashboard/dashboard.html`
- JavaScript: `static/Block/app.js`

### Configuration

- Settings: `BooklyHms/settings.py`
- Main URLs: `BooklyHms/urls.py`

### Documentation

- Full API Docs: `AUTHENTICATION.md`
- Setup Guide: `SETUP.md`
- Implementation Details: `IMPLEMENTATION.md`

---

## Common Tasks

### Register New User via Frontend

1. Go to `http://localhost:8000/auth/login/`
2. Click "Register" tab
3. Fill in email, password, confirm password
4. Click "Create Account"
5. You'll be redirected to dashboard

### Create User in Django Shell

```bash
python3 manage.py shell

from django.contrib.auth.models import User
User.objects.create_user(
    username='newuser',
    email='newuser@example.com',
    password='SecurePass123!'
)
exit()
```

### Test Rate Limiting

```bash
# Run this 5 times with wrong password
for i in {1..5}; do
  curl -X POST http://localhost:8000/auth/api/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# 6th attempt will be locked
```

### Clear Cache (Reset Rate Limiter)

```bash
python3 manage.py shell

from django.core.cache import cache
cache.clear()
exit()
```

---

## API Examples

### Register

```bash
curl -X POST http://localhost:8000/auth/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!","password_confirm":"Pass123!"}'
```

### Login

```bash
curl -X POST http://localhost:8000/auth/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!"}'
```

### Dashboard

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/auth/api/dashboard/
```

### Logout

```bash
curl -X POST http://localhost:8000/auth/api/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

---

## Troubleshooting

| Problem                           | Solution                                                 |
| --------------------------------- | -------------------------------------------------------- |
| **"Port 8000 already in use"**    | Use different port: `python3 manage.py runserver 8001`   |
| **"Database connection refused"** | Start PostgreSQL: `sudo service postgresql start`        |
| **"ModuleNotFoundError"**         | Install: `pip install -r requirements.txt`               |
| **"Static files not loading"**    | Run: `python3 manage.py collectstatic`                   |
| **"Rate limiter not working"**    | Clear cache: `python3 manage.py shell` → `cache.clear()` |
| **"CSRF token error"**            | Clear browser cache and try again                        |
| **"Token expired"**               | Login again to get new tokens                            |

---

## Performance Tips

### Development

- Use Django Debug Toolbar for profiling
- Check slow queries with: `python3 manage.py sqlshell`
- Monitor cache hits with: Django cache stats

### Production

- Use Redis instead of LocMemCache
- Enable database connection pooling
- Use Celery for async tasks
- Enable gzip compression
- Use CDN for static files
- Enable browser caching

---

## Security Checklist

Before deploying to production:

- [ ] Change `DEBUG = False`
- [ ] Generate new `SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS`
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookies
- [ ] Configure CORS properly
- [ ] Set up proper logging
- [ ] Test rate limiting
- [ ] Verify email sending
- [ ] Test all endpoints
- [ ] Check password requirements
- [ ] Test token expiration
- [ ] Review error messages (don't expose system info)

---

## Important URLs

| Page          | URL                    | Purpose           |
| ------------- | ---------------------- | ----------------- |
| Home          | `/`                    | Main page         |
| Login         | `/auth/login/`         | User login        |
| Dashboard     | `/auth/dashboard/`     | After login       |
| Admin         | `/admin/`              | Django admin      |
| Register API  | `/auth/api/register/`  | Create user       |
| Login API     | `/auth/api/login/`     | Get tokens        |
| Logout API    | `/auth/api/logout/`    | Invalidate tokens |
| Dashboard API | `/auth/api/dashboard/` | Get data          |

---

## Response Status Codes

| Code | Meaning                                     |
| ---- | ------------------------------------------- |
| 200  | Success (GET, POST)                         |
| 201  | Created (Registration success)              |
| 400  | Bad request (Validation failed)             |
| 401  | Unauthorized (Invalid credentials or token) |
| 429  | Too many requests (Rate limited)            |
| 500  | Server error                                |

---

## Quick Development Commands

```bash
# Run development server
python3 manage.py runserver

# Create migrations
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate

# Create admin user
python3 manage.py createsuperuser

# Run tests
python3 manage.py test accounts

# Access Django shell
python3 manage.py shell

# Collect static files
python3 manage.py collectstatic

# Check system status
python3 manage.py check
```

---

## Need Help?

1. **API Documentation**: Read `AUTHENTICATION.md`
2. **Setup Guide**: Read `SETUP.md`
3. **Implementation Details**: Read `IMPLEMENTATION.md`
4. **Error Messages**: Check browser console (F12)
5. **Server Logs**: Check Django terminal output
6. **Code Comments**: All files are well documented

---

## What's Next?

- [ ] Deploy to production
- [ ] Set up email notifications
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Implement OAuth2 login
- [ ] Add user roles and permissions
- [ ] Set up logging and monitoring
- [ ] Create API documentation portal
- [ ] Set up CI/CD pipeline

---

**Happy Hacking! 🚀**

For more details, see the complete documentation files in the project root.
