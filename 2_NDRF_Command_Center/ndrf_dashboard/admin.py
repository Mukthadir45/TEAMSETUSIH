from django.contrib import admin
from .models import SOSReport

# Register your models here.
@admin.register(SOSReport)
class SOSReportAdmin(admin.ModelAdmin):
    list_display = ('victim_name', 'node_id', 'medical_status', 'timestamp', 'is_rescued')
    list_filter = ('is_rescued', 'node_id')