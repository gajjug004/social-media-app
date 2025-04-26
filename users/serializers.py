from rest_framework import serializers
from .models import User, UserConnection

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model to retrieve user details."""

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "mobile",
            "created_at",
            "updated_at",
            "is_active"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for registering a new user."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "name",
            "email",
            "password",
            "mobile",
        ]

    def create(self, validated_data):
        """Create a new user with hashed password."""
        print(validated_data)
        print("Creating user with:", validated_data)  # Debugging
        user = User.objects.create_user(**validated_data)
        return user

    def validate_email(self, value):
        """Ensure email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_mobile(self, value):
        """Ensure mobile is unique."""
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("A user with this mobile number already exists.")
        return value
    
class LoginSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)
    password = serializers.CharField()

class UserConnectionSerializer(serializers.ModelSerializer):
    """Serializer for user connections"""
    
    user_from = UserSerializer()
    user_to = UserSerializer()
    
    class Meta:
        model = UserConnection
        fields = [
            "user_from",
            "user_to",
            "status",
            "created_at",
            "updated_at",
        ]