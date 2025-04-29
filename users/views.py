from rest_framework import viewsets, status
from django.db.models import Q
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, UserConnectionSerializer
from .models import User, UserConnection

class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Retrieve all users with optional search functionality"""
        queryset = User.objects.all()
        
        # Retrieve query parameters for searching
        name = request.query_params.get('name', None)
        email = request.query_params.get('email', None)
        mobile = request.query_params.get('mobile', None)

        # Apply filters if search parameters are provided
        if name:
            queryset = queryset.filter(name__icontains=name)
        if email:
            queryset = queryset.filter(email__icontains=email)
        if mobile:
            queryset = queryset.filter(mobile=mobile)

        # Serialize the filtered queryset
        serializer = UserSerializer(queryset, many=True)
        
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Retrieve details of a single user"""
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Allow user to register in the system."""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """Allow user to login in the system"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            mobile = serializer.validated_data["mobile"]
            password = serializer.validated_data["password"]

            user = authenticate(request, mobile=mobile, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=["get"])
    def connections(self, request):
        """Retrieve all user connections filtered by status"""
        connections = UserConnection.objects.filter(user_from=request.user)
        status = request.query_params.get('status')
        if status:
            connections = connections.filter(status=status)
        serializer = UserConnectionSerializer(connections, many=True)
        return Response({
            "count": connections.count(),
            "connections": serializer.data
        })
        
    @action(detail=True, methods=["post"])
    def send_connection_request(self, request, pk=None):
        """Allow the authenticated user to send a connection request to another user"""

        user_to = get_object_or_404(User, pk=pk)

        # Check if there's already a pending or accepted connection
        existing_connection = UserConnection.objects.filter(
            user_from=request.user, user_to=user_to
        ).first()

        if existing_connection:
            return Response({"detail": "Connection request already exists."}, status=status.HTTP_400_BAD_REQUEST)

        connection = UserConnection.objects.create(
            user_from=request.user,
            user_to=user_to,
            status='pending'
        )
        connection.save()

        return Response({
            "detail": "Connection request sent successfully."
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def accept_connection_request(self, request, pk=None):
        """Allow the authenticated user to accept a connection request"""

        user_to = get_object_or_404(User, pk=pk)
        
        connection = UserConnection.objects.filter(
            user_from=request.user, user_to=user_to, status='pending'
        ).first()

        if not connection:
            return Response({"detail": "No pending connection request found."}, status=status.HTTP_400_BAD_REQUEST)

        connection.status = 'accepted'
        connection.save()

        return Response({"detail": "Connection request accepted."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reject_connection_request(self, request, pk=None):
        """Allow the authenticated user to reject a connection request"""

        user_to = get_object_or_404(User, pk=pk)

        connection = UserConnection.objects.filter(
            user_from=request.user, user_to=user_to, status='pending'
        ).first()

        if not connection:
            return Response({"detail": "No pending connection request found."}, status=status.HTTP_400_BAD_REQUEST)

        connection.status = 'rejected'
        connection.save()

        return Response({"detail": "Connection request rejected."}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["get"])
    def mutual_connections(self, request, pk=None):
        """Returns mutual connections between the logged-in user and the profile user."""
        viewer = request.user
        profile_user = get_object_or_404(User, pk=pk)

        # Get accepted connections for viewer
        viewer_connections = UserConnection.objects.filter(
            Q(user_from=viewer, status='accepted')
        ).values_list('user_to_id', flat=True)

        # Get accepted connections for profile user
        profile_connections = UserConnection.objects.filter(
            Q(user_from=profile_user, status='accepted')
        ).values_list('user_to_id', flat=True)

        # Find mutual connection IDs
        mutual_ids = set(viewer_connections).intersection(set(profile_connections))

        # Fetch user objects for mutual connections
        mutual_users = User.objects.filter(id__in=mutual_ids)
        serializer = UserSerializer(mutual_users, many=True)
        return Response(serializer.data)

