
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import timezone

from .managers import CustomUserManager

class CustomUser(AbstractUser):
	email = models.EmailField(_('email address'), unique=True)

	profile_image = models.ImageField(
		upload_to="profile_images/",
		null=True,
		blank=True,
	)

	joinDate = models.CharField(max_length=200, default="1977-05-19")
	wins = models.IntegerField(default=10)
	totalGames = models.IntegerField(default=100)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ('username',)

	objects = CustomUserManager()

	def __str__(self):
		return self.email

