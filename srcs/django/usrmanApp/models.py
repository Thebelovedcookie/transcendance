
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import timezone
from .managers import CustomUserManager
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class CustomUser(AbstractUser):
	email = models.EmailField(_('email address'), unique=True)

	profile_image = models.ImageField(
		upload_to="profile_images/",
		null=True,
		blank=True,
	)

	wins = models.IntegerField(default=0)
	totalGames = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ('username',)

	objects = CustomUserManager()

	def __str__(self):
		return self.email

	def save(self, *args, **kwargs):
		if self.profile_image:
			try:
				img = Image.open(self.profile_image)
				img.verify()
				img = Image.open(self.profile_image)
				if img.mode in ("RGBA", "LA", "P"):
					img = img.convert("RGB")
				temp_img = BytesIO()
				img.save(temp_img, format="JPEG", quality=70, optimize=True)
				temp_img.seek(0)
				original_name, _ = self.profile_image.name.lower().split(".")
				img = f"{original_name}.jpg"
				self.profile_image.save(img, ContentFile(temp_img.read()), save=False)
			except (IOError, SyntaxError) as e:
				raise ValueError(f"Uploaded file is not a valid image {e}")
		super().save(*args, **kwargs)