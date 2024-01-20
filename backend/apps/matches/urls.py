from django.urls import path
from .views import MatchViewSet, CreateMatchView

urlpatterns = [
    path('matches/', MatchViewSet.as_view({'get': 'list'}), name='match-list'),
    path('matches/create_match/', CreateMatchView.as_view(), name='create-match'),
]

