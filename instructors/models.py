
from django.db import models
from users.models import CustomUser

class Instructor(models.Model):
    CAR_CHOICES = [
        ('automatic', 'Automată'),
        ('manual', 'Manuală'),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    specialization = models.ManyToManyField('CarType') 
    profile_picture = models.ImageField(upload_to='instructor_profiles/', blank=True, null=True)

    def __str__(self):
        return self.name

class CarType(models.Model):
    type_name = models.CharField(max_length=20, choices=[('automatic', 'Automată'), ('manual', 'Manuală')])

    def __str__(self):
        return self.type_name

class TimeSlot(models.Model):
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    car_type = models.CharField(max_length=20, choices=[('automatic', 'Automată'), ('manual', 'Manuală')])
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.instructor.name} - {self.date} {self.start_time} to {self.end_time}"
