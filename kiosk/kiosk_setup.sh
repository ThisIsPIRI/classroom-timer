#!/usr/bin/env sh
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install xinit
sudo apt-get install chromium-browser
sudo apt-get install matchbox-window-manager
sudo apt-get install ufw
sudo apt-get install ntp
sudo apt-get install ntpdate
sudo apt-get install unclutter
sudo ufw block all
sudo ufw allow out http
sudo ufw allow out https
sudo ufw allow out dns
sudo ufw allow out ntp


#sudo dpkg-reconfigure tzdata
#/etc/X11/xorg.config # disable screensaver
#/etc/rc.local # configure kiosk to start at startup
#disable hardware acceleration in chromium
#disable CORS restrictions, possibly by installing mie? cors from web store and enabling it in incognito
