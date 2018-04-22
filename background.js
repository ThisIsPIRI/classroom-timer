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
const body = document.getElementsByTagName("body")[0];
const footer = document.getElementsByTagName("footer")[0];
const changeBackground = function() {
	window.backgroundNum = (window.backgroundNum + 1) % window.backgroundList.length;
	body.style.backgroundImage = "url(\"" + window.backgroundList[window.backgroundNum].fileName + "\")";
	body.style.color = window.backgroundList[window.backgroundNum].enabledColor;
	if(backgroundList[backgroundNum] == null)
		footer.innerHTML = "Classroom Timer 0.6 BETA<br>이 정보를 사용함으로 인해 발생하는 손실에 대해 누구도 일절의 책임을 지지 않습니다.";
	else
		footer.innerHTML = "Classroom Timer 0.6 BETA<br>Image: " + backgroundList[backgroundNum].author + "<br>이 정보를 사용함으로 인해 발생하는 손실에 대해 누구도 일절의 책임을 지지 않습니다.";
}