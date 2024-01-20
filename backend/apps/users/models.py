from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.teams.models import Team
from django.utils import timezone


class User(AbstractUser):
    USER_TYPES = (
        ('manager', 'Manager'),
        ('player', 'Player'),
        ('guardian', 'Guardian'),
    )

    user_type = models.CharField(
        max_length=20, choices=USER_TYPES, default='player')
    birthdate = models.DateField(
        blank=True, null=True, verbose_name='Birthdate')
    verify_email_timer = models.DateTimeField(
        default=timezone.now, blank=True, null=True, verbose_name='verify email timer')
    login_attempts = models.IntegerField(default=0)
    login_timeout = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, blank=True, null=True, related_name='members')
    guardian = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='players')

    @property
    def age(self):
        if self.birthdate:
            today = timezone.now().date()
            return int((today - self.birthdate).days / 365.25)
        else:
            return None
