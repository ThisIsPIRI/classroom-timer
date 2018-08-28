//background changing
//constructor for Background objects
const Background = function(fileName, enabledColor, disabledColor, author) {
	this.fileName = fileName;
	this.enabledColor = enabledColor;
	this.disabledColor = disabledColor;
	this.author = author;
}
var backgroundList = [];
var backgroundNum = 0;
var cycleTimeout = null;
const body = document.getElementsByTagName("body")[0];
const authorShower = document.getElementById("imageAuthor");

const setBackgroundTo = function(index) {
	backgroundNum = index;
	body.style.backgroundImage = "url(\"" + window.backgroundList[window.backgroundNum].fileName + "\")";
	body.style.color = window.backgroundList[window.backgroundNum].enabledColor;

	//Modify the CSS rule for disabled texts(usually lunch menus). TODO: remove magic numbers
	rules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
	rules[7].style.color = backgroundList[backgroundNum].disabledColor;
	authorShower.innerHTML = "Image: " + (backgroundList[backgroundNum].author || '?');
}
const changeBackground = function() {
	setBackgroundTo((backgroundNum + 1) % backgroundList.length);
	if(cycleBackgrounds) {
		clearTimeout(cycleTimeout);
		if(backgroundNum !== backgroundList.length - 1) { //If we haven't reached the end of the list
			cycleTimeout = setTimeout(changeBackground, backgroundList[backgroundNum + 1].setAt - milFromMidnight(new Date()));
		}
	}
}