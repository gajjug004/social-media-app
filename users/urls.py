from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import UserViewSet

# Create separate routers for users and roles
user_router = DefaultRouter()
user_router.register(r'', UserViewSet, basename='user')  # No prefix for user routes


urlpatterns = [
    path('users/', include(user_router.urls)),  # Map UserViewSet routes directly to /api/users/
]