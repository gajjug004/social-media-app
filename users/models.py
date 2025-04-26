from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager

# Custom manager for user model
class CustomUserManager(BaseUserManager):
    def create_user(self, mobile, name, email, password=None, **extra_fields):
        if not mobile:
            raise ValueError('The Mobile field must be set')
        mobile = self.normalize_email(mobile)
        user = self.model(mobile=mobile, name=name, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, name, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(mobile, name, email, password, **extra_fields)

# User model to store all the user data
class User(AbstractUser):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    username = None
    USERNAME_FIELD = "mobile"
    REQUIRED_FIELDS = ['name', 'email']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.name

# User connection model to store user connections
class UserConnection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    user_from = models.ForeignKey(User, related_name='connections_from', on_delete=models.CASCADE)
    user_to = models.ForeignKey(User, related_name='connections_to', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user_from', 'user_to')  # Ensure a connection is unique
        
    def __str__(self):
        return f"{self.user_from.name} -> {self.user_from.name}"
    