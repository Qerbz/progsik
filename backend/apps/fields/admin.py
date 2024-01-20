from django.contrib import admin
from .models import Field, Booking

@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'field', 'start_time', 'end_time')
    search_fields = ('field__name',)
    list_filter = ('field',)

