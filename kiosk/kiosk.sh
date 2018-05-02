# Designed to run in Raspbian and from local.rc via xinit
sudo service ntp stop
sudo ntpdate 0.kr.pool.ntp.org
sudo service ntp start
sudo pkill python3
sudo pkill python
cd ct
unclutter &
python3 -m http.server &
su pi -c "chromium-browser --kiosk --incognito 0.0.0.0:8000/timer.html"

#ONLY USE WHEN ABOVE METHOD IS UNAVAILABLE su pi -c chromium-browser /home/pi/ct/timer.html --disable-web-security --user-data-dir
