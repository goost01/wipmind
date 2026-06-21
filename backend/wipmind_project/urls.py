from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/cognitive/', include('apps.cognitive.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    # Vistas de página (templates)
    path('', include('apps.users.page_urls')),
]
