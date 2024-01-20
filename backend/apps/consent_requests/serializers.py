from .models import ConsentRequest
from apps.teams.models import Team
from apps.matches.models import Match
from apps.users.models import User
from rest_framework import serializers
import pickle
import base64


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class MatchSerializer(serializers.ModelSerializer):
    team1 = TeamSerializer()
    team2 = TeamSerializer()

    class Meta:
        model = Match
        fields = '__all__'

class ConsentRequestSerializer(serializers.ModelSerializer):
    match = MatchSerializer()
    user = UserSerializer()

    request_id = serializers.SerializerMethodField()

    class Meta:
        model = ConsentRequest
        fields = ('user', 'match', 'request_status',
                  'created_at', 'updated_at', 'request_id')
        read_only_fields = ('user', 'created_at', 'updated_at',)

    def get_request_id(self, obj):  # This method will be used to encode the request id
        return base64.b64encode(pickle.dumps(obj.id))

