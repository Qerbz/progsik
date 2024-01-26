from django.shortcuts import get_object_or_404
from django.db import transaction
from django.apps import apps
from django.utils.dateparse import parse_datetime
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Match
from .serializers import MatchSerializer
from apps.fields.models import Booking, Field
from apps.teams.models import Team
from django.utils.timezone import make_aware, utc
import pytz


class MatchViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = Match.objects.all().prefetch_related('consent_requests')
    serializer_class = MatchSerializer


class CreateMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != 'manager':
            raise PermissionDenied("Only managers can create matches")

        team1_id = request.data.get('team1')
        team2_id = request.data.get('team2')
        field_id = request.data.get('field')
        description = request.data.get('description')
        date_time = request.data.get('date_time')
        user_timezone_str = request.data.get(
            'timezone', 'UTC')

        user_timezone = pytz.timezone(user_timezone_str)
        start_time_naive = parse_datetime(date_time)
        start_time_user_tz = make_aware(start_time_naive, user_timezone)

        start_time_utc = start_time_user_tz.astimezone(utc)

        end_time_utc = start_time_utc + timedelta(hours=1)

        field = get_object_or_404(Field, pk=field_id)
        bookings = Booking.objects.filter(
            field=field,
            start_time__lt=end_time_utc,
            end_time__gt=start_time_utc
        )
        if bookings.exists():
            return Response({'error': 'Field is not available during the requested time period'}, status=status.HTTP_400_BAD_REQUEST)

        team1 = get_object_or_404(Team, pk=team1_id)
        team2 = get_object_or_404(Team, pk=team2_id)


        try:
            with transaction.atomic():
                new_booking = Booking.objects.create(
                  field=field,
                  start_time=start_time_utc,
                  end_time=end_time_utc
                  )

                new_match = Match.objects.create(
                   team1=team1,
                   team2=team2,
                   date_time=start_time_utc,
                   description=description,
                   booking=new_booking
                   )

                match_serializer = MatchSerializer(new_match)

                ConsentRequest = apps.get_model(
                                'consent_requests', 'ConsentRequest')
                # Creating ConsentRequests
                for team in [team1, team2]:
                    for user in team.members.all():
                        if user.user_type == "player":
                            ConsentRequest.objects.create(
                                user=user, match=new_match)

                match_serializer = MatchSerializer(new_match)

                return Response({
                    'message': 'Match and booking created successfully',
                    'booking_id': new_booking.id,
                    'match': match_serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Handle exception or rollback
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
