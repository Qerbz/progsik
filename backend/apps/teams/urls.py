from django.urls import path
from . import views

urlpatterns = [
    path('teams/', views.TeamListView.as_view(), name='list-create-team'),
]
