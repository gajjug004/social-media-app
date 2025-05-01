from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Post
from users.models import UserConnection
from .serializers import PostSerializer

class PostViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Retrieve posts with respect to visibility and connection rules."""
        user = request.user

        # Get IDs of users the current user is connected to (accepted)
        connected_user_ids = UserConnection.objects.filter(
            user_from=user, status='accepted'
        ).values_list('user_to_id', flat=True)

        # Public posts OR private posts of self OR private posts from connected users
        posts = Post.objects.filter(
            Q(visibility='public') |
            Q(user=user) |
            Q(visibility='private', user_id__in=connected_user_ids)
        )

        # Optional: Filter by visibility if query param provided
        visibility = request.query_params.get('visibility')
        if visibility:
            posts = posts.filter(visibility=visibility)

        serializer = PostSerializer(posts.order_by('-created_at'), many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Retrieve a single post by ID."""
        post = get_object_or_404(Post, pk=pk)
        serializer = PostSerializer(post)
        return Response(serializer.data)

    def create(self, request):
        """Create a new post."""
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def my_posts(self, request):
        """Retrieve posts created by the authenticated user."""
        posts = Post.objects.filter(user=request.user)

        visibility = request.query_params.get('visibility')
        if visibility:
            posts = posts.filter(visibility=visibility)

        serializer = PostSerializer(posts, many=True)
        return Response({
            "count": posts.count(),
            "posts": serializer.data
        })
