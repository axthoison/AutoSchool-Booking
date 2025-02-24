from django.shortcuts import render, redirect
from django.http import JsonResponse
from instructors.models import TimeSlot, Instructor
from instructors.forms import InstructorForm
import json
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from bookings.models import Booking


def admin_dashboard(request):
    instructors = Instructor.objects.all()
    
    if request.method == 'POST':
        form = InstructorForm(request.POST, request.FILES)
        if form.is_valid():
            instructor, temp_password = form.save()  # Get instructor & generated password
            messages.success(request, f"Instructor '{instructor.name}' added! Temporary password: {temp_password}")
            return redirect('admin-dashboard')
    else:
        form = InstructorForm()

    return render(request, 'bookings/admin_dashboard.html', {
        'instructors': instructors,
        'form': form,
    })

@csrf_exempt
def add_timeslots(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            instructor = Instructor.objects.get(id=data['instructor'])
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            start_time = data['start_time']  
            end_time = data['end_time']  
            car_type = data['car_type']

            from datetime import timedelta
            current_date = start_date

            while current_date <= end_date:
                TimeSlot.objects.create(
                    instructor=instructor,
                    date=current_date,  
                    start_time=start_time,  
                    end_time=end_time,  
                    car_type=car_type,
                    is_booked=False
                )
                current_date += timedelta(days=1)

            return JsonResponse({'success': True})
        
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

def get_timeslots(request):
    available_slots = TimeSlot.objects.filter(is_booked=False).values(
        'id', 'date', 'start_time', 'end_time', 'car_type', 'instructor__name'
    )
    
    confirmed_bookings = Booking.objects.all().values(
        'id', 'timeslot__date', 'timeslot__start_time', 'timeslot__end_time', 
        'timeslot__car_type', 'timeslot__instructor__name', 'user__username'
    )

    return JsonResponse({
        'available_slots': list(available_slots),
        'confirmed_bookings': list(confirmed_bookings)
    })


def calendar_view(request):
    return render(request, 'bookings/calendar.html')

