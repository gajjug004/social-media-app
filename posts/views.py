from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Retrieve all posts with optional filtering by visibility."""
        posts = Post.objects.all()

        visibility = request.query_params.get('visibility')
        if visibility:
            posts = posts.filter(visibility=visibility)

        serializer = PostSerializer(posts, many=True)
        return Response({
            "count": posts.count(),
            "posts": serializer.data
        })

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
