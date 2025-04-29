from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import UserViewSet

user_router = DefaultRouter()
user_router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('users/', include(user_router.urls)),  # Map UserViewSet routes directly to /api/users/
]