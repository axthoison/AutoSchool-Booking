from django.urls import path
from .views import calendar_view, admin_dashboard, get_timeslots,add_timeslots
from instructors.views import instructor_dashboard
urlpatterns = [
    path('', calendar_view, name='calendar'),
    path('calendar/', calendar_view, name='calendar'),
    path('admin-dashboard/', admin_dashboard, name='admin-dashboard'),
    path('add-timeslots/', add_timeslots, name='add-timeslots'),
    path('get-timeslots/', get_timeslots, name='get-timeslots'),
    path('instructor-dashboard/', instructor_dashboard, name='instructor-dashboard')
]
