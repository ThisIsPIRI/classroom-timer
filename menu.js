const MenuType = Object.freeze({
	LUNCH: 0,
	DINNER: 1
});

/**Parses the content of a menu webpage and returns all items in today's menu as a list.
 * @param {String} rawMenu - The content of the webpage to parse.
 * @param {integer} day - The day for which you want the menu.
 * @param {MenuType} menuType - The type of the menu to read.
 * @returns {Array} An Array with all items in the menu as Strings. An empty Array if rawMenu was invalid.*/
const parseRawMenu = function(rawMenu, day, menuType) {
	//Go to the start of today's menu
	var i = rawMenu.indexOf(']', rawMenu.indexOf(day + 1 + "<br />[중식]", 20000)); //Start from the end of "[중식]" of today
	if(menuType === MenuType.DINNER) i = rawMenu.indexOf(']', rawMenu.indexOf("[석식]", i)) //Start from "[석식]" if parsing a dinner
		
	var buffer = "", readingName = false, menu = [], at = ' ';
	while(at !== "") {
		at = rawMenu.charAt(i);
		//If parsing a lunch, stop at [석식] (or </div> if dinner is unavailable that day).
		//If parsing a dinner, stop at </div>, which marks the end of the menu for a day.
		if((at === '[' && menuType === MenuType.LUNCH) || at === 'd') {
			return menu;
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
	return menu; //Invalid rawMenu
}

/**Fetches a menu by means of AJAX and gives it to the callback as raw String containing the HTML.
 * @param menuURL {String} The URL to fetch the menu from.
 * @param callback {Function} The Function to call after the menu is acquired. One Array, containing all menu items as Strings, will be passed into it.*/
const getMenuData = function(menuURL, callback) {
	const request = new XMLHttpRequest();
	const menuDate = new Date();
	request.onload = function() {
		callback(request.responseText);
	};
	request.open("GET", menuURL + menuDate.getFullYear() + ("0" + (menuDate.getMonth() + 1)).slice(-2), true);
	request.send();
}