@echo off
echo ===================================================
echo     SETU EMERGENCY MESH NETWORK - LAUNCH SEQUENCE
echo ===================================================

echo [1/3] Starting ESP32 Hardware Simulation (Port 8080)...
start "ESP32 Node" cmd /k "cd 1_ESP32_Hardware_Simulation && python -m http.server 8080 --bind 0.0.0.0"

echo [2/3] Starting NDRF Command Center (Django Port 8000)...
start "NDRF Basecamp" cmd /k "cd 2_NDRF_Command_Center && ..\setu_env\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

echo [3/3] Starting 3D Mesh Visualizer (Vite Port 5173)...
start "3D Visualizer" cmd /k "cd 3_3D_Mesh_Visualizer && npm run dev"

echo Waiting 5 seconds for all servers to spin up...
timeout /t 5 /nobreak > NUL

echo Launching all interfaces in your default browser...
start http://localhost:8000/dashboard/
start http://localhost:8000/radar/
start http://localhost:5173/
start http://localhost:8080/

echo ===================================================
echo SYSTEM FULLY OPERATIONAL. READY FOR PRESENTATION.
echo ===================================================
echo.
echo [PHONE SETUP] Connect the victim's smartphone to this laptop's Wi-Fi.
echo Open the phone's browser and go to one of these IP addresses at port 8080:
ipconfig | findstr /R /C:"IPv4 Address"
echo (Example: http://192.168.137.1:8080)
echo.
pause