from django.urls import path
from .views import login_view, logout_view, signup_view, password_reset_request, password_reset_confirm, dashboard_redirect
from instructors.views import instructor_dashboard

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('signup/', signup_view, name='signup'),
    path('password-reset/', password_reset_request, name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', password_reset_confirm, name='password_reset_confirm'),
    path('dashboard/', dashboard_redirect, name='dashboard_redirect'),
]

