from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.constraints import UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _


def rfc8959(s: str) -> str:
    # https://www.rfc-editor.org/rfc/rfc8959.txt
    return f"secret-token:{s}"


def get_random_secret():
    return rfc8959(get_random_string(length=50))


class User(AbstractUser):
    full_name = models.CharField(_("Full name"), blank=True, max_length=255)
    locale = models.CharField(
        max_length=8, default="", blank=True, choices=settings.LANGUAGES
    )

    class Meta:
        constraints = [
            UniqueConstraint(Lower("username"), name="unique_lower_username"),
            UniqueConstraint(Lower("email"), name="unique_lower_email"),
        ]

    def get_or_create_token(self):
        token, _ = Token.objects.get_or_create(user=self)

        if token.is_expired:
            token.delete()
            token = Token(user=self)
            token.save()

        return token


class Token(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    secret = models.CharField(
        max_length=64,
        editable=False,
        blank=False,
        default=get_random_secret,
        unique=True,
    )
    expiration_date = models.DateTimeField(
        editable=False,
        null=True,
        default=None,
    )
    created = models.DateTimeField(auto_now_add=True, editable=False)

    @property
    def is_expired(self):
        exp = self.expiration_date
        return exp is not None and exp < timezone.now()
