from rest_framework import viewsets
from .models import Objection
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ObjectionGetSerializer, ObjectionPostSerializer
from .permissions import ObjectionPermission
from rest_framework.response import Response
from rest_framework import status


class ObjectionViewSet(viewsets.ModelViewSet):

    queryset = Objection.objects.all()

    permission_classes = [ObjectionPermission]
    parser_classes = [MultiPartParser, FormParser]

    http_method_names = ['get', 'head', 'post', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return ObjectionPostSerializer

        return ObjectionGetSerializer

    def create(self, request, *args, **kwargs):
        serializer = ObjectionPostSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        return Objection.objects.filter(user=self.request.user)

