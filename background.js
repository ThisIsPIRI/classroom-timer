//background changing
//constructor for Background objects
const Background = function(fileName, enabledColor, disabledColor) {
	this.fileName = fileName;
	this.enabledColor = enabledColor;
	this.disabledColor = disabledColor;
}
backgroundData = [["background0.png", "rgb(0, 0, 0)", "rgb(200, 200, 200)"], ["background1.png", "rgb(0, 0, 0)", "rgb(200, 200, 200)"], ["background2.png", "rgb(255, 255, 255)", "rgb(30, 30, 30)"], ["background3.png", "rgb(255, 255, 255)", "rgb(30, 30, 30)"]];
backgroundList = [];
for(var i = 0;i < backgroundData.length;i++) {
	backgroundList.push(new Background(backgroundData[i][0], backgroundData[i][1], backgroundData[i][2]));
}
const body = document.getElementsByTagName("body")[0];
var backgroundNum = 2;
const changeBackground = function() {
	window.backgroundNum = (window.backgroundNum + 1) % window.backgroundList.length;
	body.style.backgroundImage = "url(\"" + window.backgroundList[window.backgroundNum].fileName + "\")";
	body.style.color = window.backgroundList[window.backgroundNum].enabledColor;
}