"""URLs que sirven los templates HTML (páginas completas)."""
from django.urls import path
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from . import page_views

urlpatterns = [
    path('', page_views.index_redirect),
    path('login/', page_views.login_page, name='login'),
    path('register/', page_views.register_page, name='register'),
    path('dashboard/', login_required(TemplateView.as_view(template_name='dashboard.html')), name='dashboard'),
    path('tasks/', login_required(TemplateView.as_view(template_name='tasks.html')), name='tasks'),
    path('profile/', login_required(TemplateView.as_view(template_name='profile.html')), name='profile'),
]
