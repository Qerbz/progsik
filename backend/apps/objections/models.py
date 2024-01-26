from django.db import models
from .validators import FileValidator


class Objection(models.Model):
    document = models.FileField(upload_to="objections", validators=[FileValidator(
        allowed_mimetypes='', allowed_extensions='', max_size=1024*1024*5)], blank=True, null=True)

    name = models.CharField(max_length=255)
    text = models.TextField(max_length=3000)

    def __str__(self):
        return self.name
