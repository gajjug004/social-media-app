from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet

post_router = DefaultRouter()
post_router.register(r'', PostViewSet, basename='post')

urlpatterns = [
    path('post/', include(post_router.urls))
]
