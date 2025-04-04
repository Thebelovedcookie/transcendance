"""
Django settings for backend_project project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

BASE_URL = "https://localhost:8000"


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS = [
# 	"localhost",
# 	"127.0.0.1",
# ]

ALLOWED_HOSTS = ['*']

AUTH_USER_MODEL = 'user_management_app.CustomUser'

# Application definition

INSTALLED_APPS = [
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'channels',
	# 'corsheaders',
	'user_management_app',
	'local_multi_game_app',
	'local_normal_game_app',
	'local_tournement_app',
	'local_ai_game_app',
	'pong_history_app',
	'remote_normal_game_app',
	'online_status_app',
]
# SO: ajout de LocaleMiddleware pour la langue
MIDDLEWARE = [
	# 'corsheaders.middleware.CorsMiddleware',
	'django.middleware.security.SecurityMiddleware',
	# 'django.middleware.locale.LocaleMiddleware',
	# 'django.contrib.sessions.middleware.SessionMiddleware',
	'user_management_app.middleware.CustomSessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

ROOT_URLCONF = 'backend_project.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [
			# BASE_DIR / "templates",
		],
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

#test
# CORS_ALLOWED_ORIGINS = [
# 	"https://localhost",
# 	"https://django",
# 	"http://localhost:8000",
# 	"http://django:8000",
# ]

# CORS_ALLOW_CREDENTIALS = True

CHANNEL_LAYERS = {
	'default': {
		'BACKEND': 'channels.layers.InMemoryChannelLayer'
	}
}

ASGI_APPLICATION = "backend_project.asgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
	'default': {
		# 'ENGINE': 'django.db.backends.sqlite3',
		'ENGINE': 'django.db.backends.postgresql',
		# "OPTIONS": {
		#     "service": "my_service",
		#     "passfile": ".my_pgpass",
		# },
		'NAME': os.getenv('POSTGRES_DB'),
		'USER': os.getenv('POSTGRES_USER'),
		'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
		'HOST': os.getenv('POSTGRES_HOST'),
		'PORT': os.getenv('POSTGRES_PORT'),
	}
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
	{
		'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
	},
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

# from django.utils.translation import gettext_lazy as _

# LANGUAGES = [
#     ('en', _('English')),
#     ('fr', _('French')),
#     ('es', _('Spanish')),
#     ('ja', _('Japanese')),
# ]

# LANGUAGE_CODE = 'en-us'

# TIME_ZONE = 'Europe/Paris'

# USE_I18N = True

# USE_TZ = True
# ajout du fichier locale des traductions


LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = '/var/www/html/static'
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
# ]

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 3600 # 1 hour

MEDIA_URL = '/media/'
MEDIA_ROOT = '/var/www/html/media'

CSRF_TRUSTED_ORIGINS = [
	'https://localhost',
	'https://localhost:8001',
	'https://127.0.0.1',
]

# email settings for dev(console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'localhost'
EMAIL_PORT = 25
DEFAULT_FROM_EMAIL = 'transcendence-pong@gmail.com'
ACTIVATION_EXPIRED_MINUTES = 10

# gmail settings for prod
# DEFAULT_FROM_EMAIL = 'transcendence-pong@gmail.com'
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
# EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
# ACTIVATION_EXPIRED_MINUTES = 10
