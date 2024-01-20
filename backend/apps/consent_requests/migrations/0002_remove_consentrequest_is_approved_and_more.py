# Generated by Django 4.0.8 on 2023-11-05 07:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('consent_requests', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='consentrequest',
            name='is_approved',
        ),
        migrations.AddField(
            model_name='consentrequest',
            name='request_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending', max_length=8),
        ),
    ]
