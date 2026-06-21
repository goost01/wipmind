from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    carrera = models.CharField(max_length=200, blank=True)
    wip_limit = models.PositiveSmallIntegerField(default=3)
    pomodoro_work_minutes = models.PositiveSmallIntegerField(default=25)
    pomodoro_break_minutes = models.PositiveSmallIntegerField(default=5)
    pomodoro_long_break_minutes = models.PositiveSmallIntegerField(default=15)
    pomodoro_cycles_before_long_break = models.PositiveSmallIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'

    def __str__(self):
        return f'Perfil de {self.user.username}'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
