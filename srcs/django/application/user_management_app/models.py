
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext as _
from .managers import CustomUserManager
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
	email = models.EmailField(_('email address'), unique=True)

	profile_image = models.ImageField(
		upload_to="profile_images/",
		null=True,
		blank=True,
	)

	friends = models.ManyToManyField('self', blank=True)
	wins = models.IntegerField(default=0)
	totalGames = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ('username',)

	objects = CustomUserManager()

	def __str__(self):
		return self.email

class EmailVerification(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	verification_code = models.CharField(max_length=6)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField()

	def save(self, *args, **kwargs):
		if not self.expires_at:
			self.expires_at = timezone.now() + timedelta(minutes=10)
		super().save(*args, **kwargs)

	def __str__(self):
		return f"EmailVerification for {self.user.email}"
