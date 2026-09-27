"""
URL configuration for setu_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from ndrf_dashboard import views

urlpatterns = [
    # 1. Built-in Database Admin (For you to manage data)
    path("admin/", admin.site.urls),

    path('api/mark_rescued/', views.mark_rescued, name='mark_rescued'),
    
    # 2. Endpoints for the Victim's Smartphone (Port 8080)
    path('api/submit_sos/', views.receive_sos, name='submit_sos'),       # Receives the form
    path('api/check_beacon/', views.check_beacon, name='check_beacon'),  # Phone polls this every 3s
    
    # 3. Endpoints for the Basecamp Commander (Tab 1)
    path('dashboard/', views.dashboard_map, name='dashboard_map'),       # Serves map.html
    path('api/get_alerts/', views.get_active_alerts, name='get_alerts'), # Map fetches data from here
    
    # 4. Endpoints for the On-Site Rescue Soldier (Tab 2)
    path('radar/', views.radar_map, name='radar_map'),                   # Serves radar.html
    path('api/trigger_beacon/', views.trigger_beacon, name='trigger_beacon') # Soldier clicks button to trigger this
]