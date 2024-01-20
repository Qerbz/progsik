from rest_framework import serializers
from .models import Objection
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse_lazy
from django.conf import settings

class ObjectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objection
        fields = ('id', 'document', "name", "text")

class ObjectionPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objection
        fields = ('id', 'document', "name", "text")


class ObjectionGetSerializer(serializers.ModelSerializer):
    link = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = Objection
        fields = ('id', 'user', 'link', 'name')

    def get_link(self, obj):
        domain = get_current_site(self.context["request"])
        link = reverse_lazy('document-download', kwargs={"pk": obj.id})

        link = f"{settings.PROTOCOL}://{domain}{link}"
        return link

    def get_name(self, obj):
        return obj.document.name.split('/')[-1]
