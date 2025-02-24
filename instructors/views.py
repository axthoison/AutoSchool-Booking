from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from bookings.models import Booking,TimeSlot

@login_required
def instructor_dashboard(request):
    if request.user.role != 'instructor':
        return redirect('login')
    instructor = request.user.instructor
    available_slots = TimeSlot.objects.filter(instructor=instructor, is_booked=False)

    # Get the instructor's confirmed bookings
    confirmed_bookings = Booking.objects.filter(timeslot__instructor=instructor)
    
    print("Bookings for instructor:", available_slots) 
    
    return render(request, 'bookings/instructor_dashboard.html', {
        'available_slots': available_slots,
        'confirmed_bookings': confirmed_bookings,
    })
