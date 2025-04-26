from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager

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
    