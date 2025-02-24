from django.urls import path
from instructors.views import instructor_dashboard

urlpatterns = [
    path('instructor-dashboard/', instructor_dashboard, name='instructor-dashboard'),
]
