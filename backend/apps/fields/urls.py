from django.urls import path
from .views import BookingsView, FieldBookingsView, CurrentFieldsView, FieldListView

urlpatterns = [
    path('bookings/', BookingsView.as_view(), name='bookings'),
    path('field-bookings/',
         FieldBookingsView.as_view(), name='field-bookings'),
    path('current-use/', CurrentFieldsView.as_view(), name='current-fields'),
    path('fields/', FieldListView.as_view(), name='field-list'),
]
