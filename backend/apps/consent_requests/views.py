from datetime import date
import pickle
import base64
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from .models import ConsentRequest
from .serializers import ConsentRequestSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone


class UserConsentRequestViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ConsentRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'guardian':
            return ConsentRequest.objects.filter(user__guardian=user, match__date_time__gte=timezone.now())
        else:
            return ConsentRequest.objects.filter(user=user, match__date_time__gte=timezone.now())


class PastConsentRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        if user.user_type == 'guardian':
            consents = ConsentRequest.objects.filter(
                user__guardian=user, match__date_time__lt=timezone.now())
        else:
            consents = ConsentRequest.objects.filter(
                user=user, match__date_time__lt=timezone.now())
        serializer = ConsentRequestSerializer(consents, many=True)
        return Response(serializer.data)


class ApproveRequestView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = date.today()
        age = today.year - user.birthdate.year - \
            ((today.month, today.day) < (user.birthdate.month, user.birthdate.day))

        if not (user.user_type == 'guardian' or (user.user_type == 'player' and age > 15)):
            return Response({"error": "Only guardians or players over 15 years old can approve requests.", "error_code": "not_authorized"}, status=403)
        if not (request.data.get('request_id')):
            return Response({'error': 'id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rId = base64.b64decode(request.data.get('request_id'))
            rId = pickle.loads(rId)

            if (user.user_type == "guardian"):
                consent_request = ConsentRequest.objects.get(
                    id=rId, user__guardian=user)
            else:
                consent_request = ConsentRequest.objects.get(
                    id=rId, user=user)

            consent_request.request_status = "accepted"
            consent_request.save()
            return Response({"message": "Request approved successfully."}, status=200)
        except ConsentRequest.DoesNotExist:
            return Response({"error": "Request not found or you are not, generics authorized to approve it."}, status=404)


class RemoveApprovalView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if not (request.data.get('request_id')):
            return Response({'error': 'id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rId = base64.b64decode(request.data.get('request_id'))
            rId = pickle.loads(rId)
            if (user.user_type == "guardian"):
                consent_request = ConsentRequest.objects.get(
                    id=rId, user__guardian=user)
            else:
                consent_request = ConsentRequest.objects.get(
                    id=rId, user=user)

            consent_request.request_status = "declined"
            consent_request.save()
            return Response({"message": "Approval removed successfully."}, status=200)
        except ConsentRequest.DoesNotExist:
            return Response({"error": "Request not found or you are not the guardian of the player."}, status=404)
