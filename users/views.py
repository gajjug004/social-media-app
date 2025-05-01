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
        queryset = User.objects.all().exclude(id=request.user.id)
        
        # Get single search query
        search = request.query_params.get('search', None)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(mobile__icontains=search)
            )

        # Serialize the filtered queryset
        serializer = UserSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Retrieve details of a single user"""
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, context={"request": request})
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
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def connections(self, request):
        """Retrieve all user connections filtered by status (bidirectional)"""
        user_id = request.query_params.get('user')
        user = get_object_or_404(User, pk=user_id) if user_id else request.user

        status_param = request.query_params.get('status')

        connections = UserConnection.objects.filter(
            Q(user_from=user) | Q(user_to=user)
        )
        if status_param:
            connections = connections.filter(status=status_param)

        # Search filter
        search = request.query_params.get('search')
        if search:
            connections = connections.filter(
                Q(user_from__name__icontains=search) |
                Q(user_to__name__icontains=search) |
                Q(user_from__email__icontains=search) |
                Q(user_to__email__icontains=search)
            )

        # Get the other user in each connection
        connection_data = []
        for connection in connections:
            other_user = connection.user_to if connection.user_from == user else connection.user_from
            serialized_user = UserSerializer(other_user).data
            serialized_user['connection_status'] = connection.status
            connection_data.append(serialized_user)

        return Response({
            "count": len(connection_data),
            "connections": connection_data
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

        user_from = get_object_or_404(User, pk=pk)
        user_to = request.user
        
        connection = UserConnection.objects.filter(
            user_from=user_from, user_to=user_to, status='pending'
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

        # Get all accepted connections of viewer (both directions)
        viewer_connections = UserConnection.objects.filter(
            Q(user_from=viewer, status='accepted') | Q(user_to=viewer, status='accepted')
        ).values_list('user_from_id', 'user_to_id')

        viewer_ids = set()
        for uf, ut in viewer_connections:
            viewer_ids.add(uf if uf != viewer.id else ut)

        # Get all accepted connections of profile_user (both directions)
        profile_connections = UserConnection.objects.filter(
            Q(user_from=profile_user, status='accepted') | Q(user_to=profile_user, status='accepted')
        ).values_list('user_from_id', 'user_to_id')

        profile_ids = set()
        for uf, ut in profile_connections:
            profile_ids.add(uf if uf != profile_user.id else ut)

        # Find mutual connection IDs
        mutual_ids = viewer_ids.intersection(profile_ids)

        mutual_users = User.objects.filter(id__in=mutual_ids)
        serializer = UserSerializer(mutual_users, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=["get"])
    def pending_connections(self, request):
        """Retrieve all pending connections"""

        user = request.user
        connections = UserConnection.objects.filter(user_to=user, status='pending')
        serializer = UserConnectionSerializer(connections, many=True)
        return Response({
            "count": connections.count(),
            "connections": serializer.data
        })
