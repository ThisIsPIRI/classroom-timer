const Background = function(fileName, enabledColor, disabledColor, author) {
	this.fileName = fileName;
	this.enabledColor = enabledColor;
	this.disabledColor = disabledColor;
	this.author = author;
}
const BgManager = function(body, authorShower) {
	this.bgList = [];
	this.curIdx = 0;
	this.cycleTimeout = null;
	this.body = body;
	this.authorShower = authorShower;
}
BgManager.prototype.setBackgroundTo = function(index) {
	this.curIdx = index;
	this.body.style.backgroundImage = "url(\"" + this.bgList[this.curIdx].fileName + "\")";
	this.body.style.color = this.bgList[this.curIdx].enabledColor;

	//Modify the CSS rule for disabled texts(usually lunch menus). TODO: remove magic numbers
	const rules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
	rules[7].style.color = this.bgList[this.curIdx].disabledColor;
	this.authorShower.innerHTML = "Image: " + (this.bgList[this.curIdx].author || '?');
}
BgManager.prototype.changeBackground = function() {
	this.setBackgroundTo((this.curIdx + 1) % this.bgList.length);
	if(cycleBackgrounds) {
		clearTimeout(this.cycleTimeout);
		if(this.curIdx !== this.bgList.length - 1) { //If we haven't reached the end of the list
			this.cycleTimeout = setTimeout(() => this.changeBackground.call(this), this.bgList[this.curIdx + 1].setAt - milFromMidnight(new Date()));
		}
	}
}
