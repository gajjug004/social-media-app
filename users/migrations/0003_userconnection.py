# Generated by Django 5.2 on 2025-04-26 11:26

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_user_managers_user_created_at_user_updated_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserConnection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user_from', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='connections_from', to=settings.AUTH_USER_MODEL)),
                ('user_to', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='connections_to', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user_from', 'user_to')},
            },
        ),
    ]
