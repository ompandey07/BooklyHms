# BookLy HMS - Setup & Installation Guide

## Quick Start

### 1. Install Dependencies

```bash
pip install django djangorestframework djangorestframework-simplejwt python-decouple pillow psycopg2-binary
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=bookly_hms
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 3. Create Database

```bash
# Create PostgreSQL database
createdb bookly_hms
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

Server will be available at: `http://localhost:8000`

---

## URLs

| Page           | URL                                     |
| -------------- | --------------------------------------- |
| Login/Register | `http://localhost:8000/auth/login/`     |
| Dashboard      | `http://localhost:8000/auth/dashboard/` |
| Admin          | `http://localhost:8000/admin/`          |

---

## Testing Authentication

### Test 1: Create User via API

```bash
curl -X POST http://localhost:8000/auth/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "username": "john"
  }'
```

**Expected Result**: 201 status with user data and tokens

### Test 2: Login via API

```bash
curl -X POST http://localhost:8000/auth/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Result**: 200 status with tokens

### Test 3: Access Dashboard API

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/auth/api/dashboard/
```

**Expected Result**: 200 status with user data

### Test 4: Rate Limiting

Try login 5 times with wrong password:

```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/auth/api/login/ \
    -H "Content-Type: application/json" \
    -d '{
      "email": "john@example.com",
      "password": "WrongPassword"
    }'
done
```

**Expected Result**: 5th attempt returns 429 status with lockout message

### Test 5: Logout

```bash
curl -X POST http://localhost:8000/auth/api/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Result**: 200 status with success message

---

## Frontend Testing

### Via Browser

1. Open `http://localhost:8000/auth/login/`
2. Click on "Register" tab
3. Fill in registration form:
   - Email: `test@example.com`
   - Username: `testuser` (optional)
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
4. Click "Create Account"
5. You'll be redirected to dashboard
6. Click "Logout" to test logout

---

## Important Files

| File                                | Purpose                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `accounts/views.py`                 | All authentication views and API endpoints              |
| `accounts/auth_utils.py`            | Password validation, email validation, token generation |
| `accounts/rate_limiter.py`          | Rate limiting logic for login attempts                  |
| `accounts/decorators.py`            | JWT authentication decorator                            |
| `accounts/routes.py`                | URL routing for auth endpoints                          |
| `Frontend/accounts/login.html`      | Login/register page UI                                  |
| `Frontend/dashboard/dashboard.html` | Dashboard UI after login                                |
| `static/Block/app.js`               | Frontend JavaScript logic                               |

---

## How to Test in Development

### Using Django Shell

```bash
python manage.py shell

# Create test user
from django.contrib.auth.models import User
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='TestPass123!'
)

# Generate tokens
from accounts.auth_utils import AuthenticationManager
tokens = AuthenticationManager.generate_tokens(user)
print(tokens)

# Exit shell
exit()
```

### Using Postman

1. Import the provided Postman collection
2. Set base URL: `http://localhost:8000`
3. Run requests in order:
   - Register user
   - Login
   - Access dashboard
   - Logout

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'rest_framework_simplejwt'"

**Solution**:

```bash
pip install djangorestframework-simplejwt
```

### Issue: "Database connection refused"

**Solution**:

```bash
# Ensure PostgreSQL is running
sudo service postgresql start

# Or use SQLite for development
# Change DATABASE in settings.py to SQLite
```

### Issue: Static files not loading

**Solution**:

```bash
python manage.py collectstatic --noinput
```

### Issue: CSRF token mismatch

**Solution**: The JavaScript automatically fetches CSRF token from `/auth/api/csrf-token/`

---

## Performance Optimization

### Caching

The system uses Django's local memory cache for rate limiting. For production, use Redis:

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Token Optimization

- Access tokens are short-lived (24 hours)
- Refresh tokens enable token rotation
- Implement token refresh in frontend before expiry

---

## Production Deployment

### Security Checklist

- [ ] Set `DEBUG = False`
- [ ] Set `SECRET_KEY` to a strong random string
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS if frontend is on different domain
- [ ] Use Redis for caching
- [ ] Set up proper logging
- [ ] Configure email backend properly
- [ ] Use database connection pooling

---

## Support & Documentation

- **Django**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **djangorestframework-simplejwt**: https://django-rest-framework-simplejwt.readthedocs.io/

---

**Happy Coding!** 🚀
