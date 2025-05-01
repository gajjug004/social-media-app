from rest_framework import serializers
from django.db.models import Q
from .models import User, UserConnection

class UserSerializer(serializers.ModelSerializer):
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "mobile",
            "created_at",
            "updated_at",
            "is_active",
            "connection_status"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_connection_status(self, obj):
        """Return the connection status between the requesting user and the target user."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return "none"

        # Check for a connection either way
        connection = UserConnection.objects.filter(
            Q(user_from=request.user, user_to=obj) |
            Q(user_from=obj, user_to=request.user)
        ).order_by('-created_at').first()  # In case multiple, get the latest

        if connection:
            return connection.status  # 'accepted', 'pending', or 'rejected'
        
        return "none"


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