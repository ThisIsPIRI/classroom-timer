const rainbow = {
		elements : [],
		intervalNum : NaN,
		rainbowInternal : function() {
			for(var i = 0;i < rainbow.elements.length;i++) {
				rainbow.elements[i].style.color = "hsl(" + rainbow.elements[i].hue + ", 100%, 60%)";
				rainbow.elements[i].hue = (rainbow.elements[i].hue + 1) % 360;
			}
		},
		start : function(element, startHue) {
			element.hue = startHue; //Add hue property to the element
			element.originalColor = element.style.color;
			rainbow.elements.push(element);
			if(rainbow.elements.length === 1) { //Start a new loop only when it's not currently running
				rainbow.intervalNum = setInterval(rainbow.rainbowInternal, 10);
			}
		},
		/*stop : function(element) {
			element.style.color = element.originalColor;
			rainbow.elements.splice(rainbow.elements.find(element), 1); //find() doesn't find the element. TODO: further debugging needed.
			if(rainbow.elements.length === 0) clearInterval(rainbow.intervalNum);
		},*/
		stopAll : function() {
			for(var i = 0;i < rainbow.elements.length;i++) {
				rainbow.elements[i].style.color = rainbow.elements[i].originalColor;
			}
			clearInterval(rainbow.intervalNum);
			rainbow.elements = [];
		}
}