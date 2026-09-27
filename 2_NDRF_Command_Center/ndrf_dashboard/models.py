from django.db import models

# Create your models here.

class SOSReport(models.Model):
    node_id = models.CharField(max_length=50, help_text="Which street node sent this")
    victim_name = models.CharField(max_length=100)
    people_count = models.IntegerField(default=1)
    medical_status = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_rescued = models.BooleanField(default=False)

    beacon_active = models.BooleanField(default=False)

    def __str__(self):
        return f"SOS: {self.victim_name} at {self.node_id}"