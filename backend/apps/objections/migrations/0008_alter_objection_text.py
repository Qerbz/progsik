# Generated by Django 4.0.8 on 2023-11-16 12:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('objections', '0007_objection_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='objection',
            name='text',
            field=models.TextField(max_length=3000),
        ),
    ]
