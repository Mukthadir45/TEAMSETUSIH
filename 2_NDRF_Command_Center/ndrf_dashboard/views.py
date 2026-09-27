from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SOSReport

@api_view(['POST'])
def receive_sos(request):
    """ Simulated endpoint for receiving LoRa mesh data """
    data = request.data
    
    report = SOSReport.objects.create(
        node_id=data.get('node_id', 'UNKNOWN_NODE'),
        victim_name=data.get('victim_name', 'Anonymous'),
        people_count=data.get('people_count', 1),
        medical_status=data.get('medical_status', 'Not specified'),
        latitude=data.get('latitude', 0.0),
        longitude=data.get('longitude', 0.0)
    )
    
    return Response({"status": "success", "message": "SOS received by NDRF Gateway", "id": report.id})

@api_view(['GET'])
def get_active_alerts(request):
    """ Endpoint for the NDRF laptop map to fetch live emergencies """
    alerts = SOSReport.objects.filter(is_rescued=False).values()
    return Response({"alerts": list(alerts)})

# ADDED @csrf_exempt HERE to allow the button to work
@csrf_exempt
@api_view(['POST', 'GET']) # Added GET as a fallback to make it bulletproof
def trigger_beacon(request):
    """ The NDRF Radar calls this to turn on the beacon for a specific victim """
    # DRF prefers query_params over GET for API views
    victim_id = request.query_params.get('id') or request.GET.get('id')
    
    report = SOSReport.objects.filter(id=victim_id).first()
    if report:
        report.beacon_active = True
        report.save()
        return Response({"status": "success", "message": f"Beacon activated for {report.victim_name}"})
    return Response({"status": "error"}, status=404)

@api_view(['GET'])
def check_beacon(request):
    """ The Victim's phone constantly calls this to check its status """
    victim_name = request.GET.get('name')
    
    report = SOSReport.objects.filter(victim_name=victim_name, is_rescued=False).last()
    
    if report and report.beacon_active:
        return Response({"beacon_active": True})
    return Response({"beacon_active": False})

@csrf_exempt
@api_view(['POST', 'GET'])
def mark_rescued(request):
    """ The Field Radar calls this when a victim is physically secured """
    victim_id = request.query_params.get('id') or request.GET.get('id')
    
    report = SOSReport.objects.filter(id=victim_id).first()
    if report:
        report.is_rescued = True
        report.save()
        return Response({"status": "success", "message": f"{report.victim_name} marked as rescued."})
    return Response({"status": "error"}, status=404)

def radar_map(request):
    """ Serves the Field Radar HTML page """
    return render(request, 'ndrf_dashboard/radar.html')

def dashboard_map(request):
    """ Serves the Basecamp Macro Map HTML page """
    return render(request, 'ndrf_dashboard/map.html')