/**Returns a String with every element in menuStrings separated by a <br>.*/
const makeMenuString = function(menuStrings) {
	if(!Array.isArray(menuStrings)) return "";
	var result = "";
	for(var i = 0;i < menuStrings.length;i++) {
		result += menuStrings[i] + "<br>";
	}
	return result;
};

/**Constructs a timetable String from an Array of Strings.
 * @param subjects {Array} The Array containing names of the subjects.
 * @param nextTime {integer} The index of the next(current if inside a class) in subjects.
 * @returns {String} A String with the next subject inside a span with id "current".*/
const makeTimetableString = function(day, nextTime) {
	var tableString = "";
	for(var i = 0;i < day.subjects.length;i++) {
		if(i === nextTime) {
			tableString += "<span id=\"current\">" + day.subjects[i] + "</span>, ";
		}
		else
			tableString += day.subjects[i] + ", ";
	}
	return tableString.substr(0, tableString.length - 2);
};

/**Returns milliseconds from the last midnight at given hours, minutes and seconds from the midnight.*/
const milFromMidnight = function(hours, minutes, seconds) {
	seconds = seconds != null ? seconds : 0;
	return hours * 3600000 + minutes * 60000 + seconds * 1000;
}