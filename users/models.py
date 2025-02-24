from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
        ('instructor', 'Instructor'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)  # Ensure email is unique

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_users_groups',  
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_users_permissions',  
        blank=True
    )

    def __str__(self):
        return self.username
