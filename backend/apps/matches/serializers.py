from .models import Match, Team, ConsentRequest
from rest_framework import serializers
from apps.fields.serializers import BookingSerializer

class ConsentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentRequest
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    team1 = TeamSerializer()
    team2 = TeamSerializer()
    consent_requests = ConsentRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Match
        fields = '__all__'

