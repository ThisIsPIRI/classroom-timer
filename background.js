//background changing
//constructor for Background objects
const Background = function(fileName, enabledColor, disabledColor) {
	this.fileName = fileName;
	this.enabledColor = enabledColor;
	this.disabledColor = disabledColor;
}
backgroundList = [];
const body = document.getElementsByTagName("body")[0];
var backgroundNum = 0;
const changeBackground = function() {
	window.backgroundNum = (window.backgroundNum + 1) % window.backgroundList.length;
	body.style.backgroundImage = "url(\"" + window.backgroundList[window.backgroundNum].fileName + "\")";
	body.style.color = window.backgroundList[window.backgroundNum].enabledColor;
}