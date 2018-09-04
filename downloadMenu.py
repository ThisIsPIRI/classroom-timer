# TODO: Make a native version
# TODO: Generalize and move to Python Tools
"""Pass the URL of the page to download as the first command-line argument."""
import urllib.request
import sys
try:
	with urllib.request.urlopen(sys.argv[1]) as request:
		result = request.read()
except urllib.error.URLError:
	print("Failed to access the URL. Check your internet connection")
	sys.exit()
with open("menu.html", 'wb') as file:
	file.write(result)