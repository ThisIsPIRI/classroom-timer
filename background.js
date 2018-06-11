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
const footer = document.getElementsByTagName("footer")[0];

const setBackgroundTo = function(index) {
	backgroundNum = index;
	body.style.backgroundImage = "url(\"" + window.backgroundList[window.backgroundNum].fileName + "\")";
	body.style.color = window.backgroundList[window.backgroundNum].enabledColor;
	
	//Modify the CSS rule for disabled texts(usually lunch menus). TODO: remove magic numbers
	rules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
	rules[7].style.color = backgroundList[backgroundNum].disabledColor;
	
	if(backgroundList[backgroundNum].author == null)
		footer.innerHTML = "Classroom Timer 0.6 BETA<br>이 정보를 사용함으로 인해 발생하는 손실에 대해 누구도 일절의 책임을 지지 않습니다.";
	else
		footer.innerHTML = "Classroom Timer 0.6 BETA<br>Image: " + backgroundList[backgroundNum].author + "<br>이 정보를 사용함으로 인해 발생하는 손실에 대해 누구도 일절의 책임을 지지 않습니다.";
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