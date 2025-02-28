from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from bookings.models import Booking,TimeSlot
from django.template.defaultfilters import json_script

@login_required
def instructor_dashboard(request):
    if request.user.role != 'instructor':
        return redirect('login')
    instructor = request.user.instructor
    available_slots = TimeSlot.objects.filter(
        instructor=instructor, 
        is_booked=False
    ).values(
        'id', 'date', 'start_time', 'end_time', 'car_type'
    )
    available_slots = [
        {
            'id': slot['id'],
            'date': slot['date'].isoformat(),
            'start_time': slot['start_time'].strftime('%H:%M'),
            'end_time': slot['end_time'].strftime('%H:%M'),
            'car_type': slot['car_type'],
        }
        for slot in available_slots
    ]

    # Fetch confirmed bookings (aligned with get_timeslots)
    confirmed_bookings = Booking.objects.filter(
        timeslot__instructor=instructor
    ).values(
        'id', 
        'timeslot__date', 
        'timeslot__start_time', 
        'timeslot__end_time',
        'timeslot__car_type', 
        'user__username', 
        'status'
    )
    confirmed_bookings = [
        {
            'id': booking['id'],
            'timeslot__date': booking['timeslot__date'].isoformat(),
            'timeslot__start_time': booking['timeslot__start_time'].strftime('%H:%M'),
            'timeslot__end_time': booking['timeslot__end_time'].strftime('%H:%M'),
            'timeslot__car_type': booking['timeslot__car_type'],
            'user__username': booking['user__username'],
            'status': booking['status'],
        }
        for booking in confirmed_bookings
    ]

    print("Available slots for instructor:", available_slots)
    print("Confirmed bookings for instructor:", confirmed_bookings)

    return render(request, 'bookings/instructor_dashboard.html', {
        'instructor': instructor,
        'available_slots': available_slots,
        'confirmed_bookings': confirmed_bookings,  # Updated to match naming
    })
    