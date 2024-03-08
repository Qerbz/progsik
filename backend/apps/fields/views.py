import pytz
from datetime import timedelta
from dateutil.parser import isoparse
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import BookingSerializer, FieldSerializer
from .models import Field, Booking
from django.utils import timezone


class FieldListView(generics.ListAPIView):
    queryset = Field.objects.all()
    serializer_class = FieldSerializer


class BookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class FieldBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        field_id = request.data.get('field_id')
        date_str = request.data.get('date')
        user_timezone_str = request.data.get('timezone')

        if date_str is None:
            return Response({'error': 'Date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if user_timezone_str is None:
            return Response({'error': 'Timezone is required'}, status=status.HTTP_400_BAD_REQUEST)

        date_obj = isoparse(date_str)

        # Convert UTC date to user's timezone
        user_timezone = pytz.timezone(user_timezone_str)
        local_date_obj = date_obj.astimezone(user_timezone)

        start_time = local_date_obj
        end_time = start_time + timedelta(days=1)

        # Safe, parameterized SQL query
        query = "SELECT * FROM fields_booking WHERE field_id = %s AND %s <= end_time AND %s >= start_time"

        bookings = Booking.objects.raw(query, [field_id, start_time, end_time])

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)



class CurrentFieldsView(APIView):
    """
    API endpoint that returns all fields that are currently in use.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the current time
        now = timezone.now()

        # Query for bookings that are currently active
        current_bookings = Booking.objects.filter(
            start_time__lte=now, end_time__gte=now)

        # Get the fields related to these bookings
        current_fields = Field.objects.filter(
            booking__in=current_bookings).distinct()

        # Serialize the field data
        field_data = [{'field_id': field.id, 'field_name': field.name}
                      for field in current_fields]

        # Return the response
        return Response(field_data)
