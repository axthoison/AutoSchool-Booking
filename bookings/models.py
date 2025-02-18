from django.db import models
from users.models import CustomUser
from instructors.models import TimeSlot

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'În așteptare'),
        ('confirmed', 'Confirmat'),
        ('cancelled', 'Anulat'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    timeslot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.user.username} - {self.timeslot} - {self.get_status_display()}"
