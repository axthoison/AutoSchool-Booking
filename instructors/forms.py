import random
import string
from django import forms
from users.models import CustomUser
from .models import Instructor

class InstructorForm(forms.ModelForm):
    email = forms.EmailField(required=True, help_text="Introduceți email-ul instructorului.")

    class Meta:
        model = Instructor
        fields = ['name', 'email', 'profile_picture']  # Email is here so admin enters it manually

    def save(self, commit=True):
        name = self.cleaned_data['name']
        email = self.cleaned_data['email']  # Admin enters this manually

        # Generate a random password
        def generate_password(length=10):
            characters = string.ascii_letters + string.digits
            return ''.join(random.choice(characters) for _ in range(length))

        temp_password = generate_password()

        # Create a user account for the instructor
        user = CustomUser.objects.create_user(username=email, email=email)
        user.set_password(temp_password)  # Set the generated password
        user.role = 'instructor'  # Assign role
        user.is_active = True  # Allow login immediately
        user.save()

        # Create Instructor linked to user
        instructor = super().save(commit=False)
        instructor.user = user  # Link instructor to user
        if commit:
            instructor.save()

        return instructor, temp_password  # Return instructor and password
