#!/usr/bin/env sh
# Written for Raspbian. Usage: sudo xinit ./kiosk.sh
sudo service ntp stop
sudo ntpdate 0.kr.pool.ntp.org
sudo service ntp start
sudo pkill python3
sudo pkill python
cd ct
cd lib
# The resulting string below is the same as what AddDate in data.txt adds to the menuURL.
yearMonth=$(date +%Y%m)
wget -O menu$yearMonth "https://stu.sen.go.kr/sts_sci_md00_001.do?schulCode=B100000456&schulCrseScCode=3&SchulKndScCode=04&schYm="
cd ..
unclutter &
python3 -m http.server &
su pi -c "chromium-browser --window-size=1920,1080 --kiosk --incognito 0.0.0.0:8000/timer.html"

#su pi -c chromium-browser /home/pi/ct/timer.html --disable-web-security --user-data-dir --kiosk
