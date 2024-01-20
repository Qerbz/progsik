from django.urls import path
from .views import ObjectionViewSet

urlpatterns = [
    path('objections/create_objection/', ObjectionViewSet.as_view({'post': 'create'}), name='create_objection'),
    ]
