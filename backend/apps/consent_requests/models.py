from django.db import models
from apps.users.models import User


class ConsentRequest(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='consent_requests')
    match = models.ForeignKey(
        'matches.Match',
        on_delete=models.CASCADE,
        related_name='consent_requests'
    )
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    request_status = models.CharField(
        max_length=8,
        choices=STATUS_CHOICES,
        default='pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'match']

    def __str__(self):
        return f"Consent Request for {self.user.username} for Match {self.match.id}"
