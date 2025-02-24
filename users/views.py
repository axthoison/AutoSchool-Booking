from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from .forms import CustomUserCreationForm

from .models import CustomUser

# Signup View
def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)  
            user.role = 'user'  
            user.save()
            login(request, user)
            return redirect('dashboard_redirect')
    else:
        form = CustomUserCreationForm()
    return render(request, 'bookings/signup.html', {'form': form})  

# Login View
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard_redirect')
    else:
        form = AuthenticationForm()
    return render(request, 'bookings/login.html', {'form': form})  


def logout_view(request):
    logout(request)
    return redirect('login')


def password_reset_request(request):
    if request.method == "POST":
        email = request.POST.get("email")
        user = CustomUser.objects.filter(email=email).first()
        if user:
            subject = "Password Reset Requested"
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = request.build_absolute_uri(f'/users/password-reset-confirm/{uid}/{token}/')
            message = render_to_string('bookings/password_reset_email.html', {'reset_url': reset_url})  # Updated path
            send_mail(subject, message, 'liaolaru6@gmail.com', [user.email])
            messages.success(request, "Check your email for a password reset link.")
            return redirect('login')
    return render(request, "bookings/password_reset.html")  


def password_reset_confirm(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == "POST":
            new_password = request.POST.get("new_password")
            user.set_password(new_password)
            user.save()
            messages.success(request, "Password has been reset. You can now log in.")
            return redirect('login')
        return render(request, "bookings/password_reset_confirm.html", {"valid_link": True})  
    return render(request, "bookings/password_reset_confirm.html", {"valid_link": False})  

@login_required
def dashboard_redirect(request):
    CustomUser = get_user_model()  # Get the user model dynamically
    user = CustomUser.objects.get(pk=request.user.pk)  # Fetch the full object

    print(f"User: {user}, Role: {user.role}")
    
    if user.role == 'admin':
        return redirect('admin-dashboard')
    elif user.role == 'instructor':
        return redirect('instructor-dashboard')
    else:
        return redirect('calendar')
