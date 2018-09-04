# TODO: Make a native version
import urllib.request
import sys
try:
	with urllib.request.urlopen("http://thisispiri.github.io/web-tools/") as request:
		result = request.read()
except urllib.error.URLError:
	print("Failed to access the URL. Check your internet connection")
	sys.exit()
with open("menu.html", 'wb') as file:
	file.write(result)