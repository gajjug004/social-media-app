from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    
    username = None 
    USERNAME_FIELD = "mobile"
    REQUIRED_FIELDS = ['name', 'email']
    
    def __str__(self):
        return self.name
    