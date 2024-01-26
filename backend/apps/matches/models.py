from django.apps import apps
from apps.teams.models import Team
from apps.fields.models import Booking
from django.db import models


class Match(models.Model):
    team1 = models.ForeignKey(
        Team, related_name='home_matches', on_delete=models.CASCADE)
    team2 = models.ForeignKey(
        Team, related_name='away_matches', on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    description = models.TextField(null=True, blank=True)
    booking = models.ForeignKey(
        Booking, related_name='matches', on_delete=models.CASCADE)
