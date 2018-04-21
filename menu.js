const MenuType = Object.freeze({
	LUNCH: 0,
	DINNER: 1
});

const makeMenuString = function(menuStrings) {
	var result = "";
	for(var i = 0;i < menuStrings.length;i++) {
		result += menuStrings[i] + "<br>";
	}
	return result;
}

const getMenuData = function(menuURL, menuType, callback) { //Pass a function as callback to receive the menus as Strings in an array.
	const request = new XMLHttpRequest();
	const menuDate = new Date();
	request.onload = function() {
		var rawMenu = request.responseText;
		//Go to the start of today's menu
		var i = rawMenu.indexOf(']', rawMenu.indexOf(menuDate.getDate() + 1 + "<br />[중식]", 20000)); //Start from the end of "[중식]" of today
		if(menuType === MenuType.DINNER) i = rawMenu.indexOf(']', rawMenu.indexOf("[석식]", i)) //Start from "[석식]" if parsing a dinner
			
		var buffer = "", readingName = false, menu = [], at = ' ';
		while(at !== "") {
			at = rawMenu.charAt(i);
			//If parsing a lunch, stop at [석식] or </div>. if dinner is unavailable that day.
			//If parsing a dinner, stop at </div>, which marks the end of the menu for a day.
			if((at === '[' && menuType === MenuType.LUNCH) || at === 'd') {
				callback(menu);
				return;
			}
			else if((!isNaN(parseFloat(at)) || at === '<') && readingName) {
				readingName = false; //Stop reading if a number(allergy information) or < is reached
				menu.push(buffer);
				buffer = "";
			}
			else if(at === '>') readingName = true;
			else if(readingName) buffer += at;
			i++;
		}
	}
	request.open("GET", menuURL + menuDate.getFullYear() + ("0" + (menuDate.getMonth() + 1)).slice(-2), true);
	request.send();
}