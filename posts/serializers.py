from rest_framework import serializers
from .models import Post
from users.serializers import UserSerializer

class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model."""
    user = UserSerializer(read_only=True)  # Nested user info

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "content",
            "image",
            "visibility",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]
