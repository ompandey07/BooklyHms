"""
Django settings for HMS project.
"""

from pathlib import Path
from decouple import config

##########################
# BASE DIRECTORY
##########################

BASE_DIR = Path(__file__).resolve().parent.parent


##########################
# SECURITY SETTINGS
##########################

SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]


##########################
# APPLICATION DEFINITION
##########################

INSTALLED_APPS = [
    'jazzmin',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',

    'accounts',
    'guests',
    'rooms',
    'bookings',
    'staff',
    'referrals',
    'billing',
    'reports',
    'core',
]


##########################
# MIDDLEWARE
##########################

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


##########################
# URL CONFIGURATION
##########################

ROOT_URLCONF = 'BooklyHms.urls'


##########################
# TEMPLATES CONFIGURATION
##########################

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'Frontend'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


##########################
# WSGI / ASGI
##########################

WSGI_APPLICATION = 'BooklyHms.wsgi.application'
ASGI_APPLICATION = 'BooklyHms.asgi.application'


##########################
# DATABASE CONFIGURATION
##########################

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}


##########################
# PASSWORD VALIDATION
##########################

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


##########################
# INTERNATIONALIZATION
##########################

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True


##########################
# STATIC FILES CONFIG
##########################

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'


##########################
# MEDIA FILES CONFIG
##########################

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


##########################
# DEFAULT PRIMARY KEY
##########################

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


##########################
# EMAIL SETTINGS
##########################

EMAIL_BACKEND = config('EMAIL_BACKEND')
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')


##########################
# REST FRAMEWORK / JWT
##########################

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'TOKEN_USER_CLASS': 'django.contrib.auth.models.User',
}

##########################
# CACHING CONFIGURATION
##########################

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'bookly-hms-cache',
        'OPTIONS': {
            'MAX_ENTRIES': 10000
        }
    }
}


##########################
# JAZZMIN ADMIN SETTINGS
##########################

JAZZMIN_SETTINGS = {
    "site_title": "HMS Admin",
    "site_header": "Hotel Management System",
    "site_brand": "HMS",
    "welcome_sign": "Welcome to HMS Admin Panel",
    "copyright": "HMS",
    "show_sidebar": True,
    "navigation_expanded": True,
}