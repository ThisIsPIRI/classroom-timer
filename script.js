//TODO: refactor into a class(not necessarily an ES6 class)
/**Entry(a class, recess, lunch ...) constructor.*/
const Entry = function(type, start, end, subIndex) {
	this.type = type;
	this.start = start;
	this.end = end;
	this.subIndex = subIndex; //The index of this subject in week[day].subjects
}
Entry.Type = Object.freeze({
	RECESS : 0,
	CLASS : 1,
	MEAL : 2
});
/**The constructor for DayWeek Objects, containing everything about a day of the week.*/
const DayWeek = function(n, start, lun, lunStart, sub, ent) {
	this.name = n;
	//No optional arguments; we might have to support IEs.
	this.startTime = start != undefined ? start : 0;
	this.subjects = sub != undefined ? sub : [];
	this.entries = ent != undefined ? ent : [];
	this.lunchTime = lun != undefined ? lun : 0;
	this.lunchStart = lunStart != undefined ? lunStart : 0;
}

//elements
const date = document.getElementById("date"), time = document.getElementById("time"), subject = document.getElementById("subject");
const remaining = document.getElementById("remaining"), timetable = document.getElementById("timetable");
const menuText = document.getElementById("menuText"), totalTime = document.getElementById("totalTime");
//State variables
var inFreetime = true; //Every day starts with a recess
var lastEntry = null;
var nextIndex = null;
//other global variables
const weekNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const week = []; //Where all day-specific information is stored
var classTime = [], restTime = []; //Not const because they have to be a property of window
var bellError = 0;
var totalPhysicalTime = NaN; //The total duration of school in the day
var menuURL = null; //The URL to fetch the menus from
var backgroundNum = 0;
var rawMenuCache = "";
var lunchMenu = [], dinnerMenu = [];
var dayUpdateTimeout = null;

/**Updates variables after a change in the current day. Must be called AFTER fileReader callback.*/
const dayUpdate = function() {
	var initDate = new Date();
	var initDay = initDate.getDay();
	date.innerHTML = initDate.getFullYear() + "년 " + (initDate.getMonth() + 1) + "월 " + initDate.getDate() + "일 " + weekNames[initDay];
	//Update the total time.
	totalPhysicalTime = getTotalTime(initDay);
	
	//Remove the last Entry yesterday.
	lastEntry = null;
	
	//Update the total time in school.
	totalPhysicalTime = getTotalTime(initDay);
	
	//Cache and update the menu.
	lunchMenu = parseRawMenu(rawMenuCache, initDay, MenuType.LUNCH);
	dinnerMenu = parseRawMenu(rawMenuCache, initDay, MenuType.DINNER);
	menuText.innerHTML = makeMenuString(lunchMenu);
	
	//Make the menu visible again, in case it was greyed out.
	menuText.style.color = backgroundList[backgroundNum].enabledColor;
	
	//Update the timetable.
	freeOrClassUpdate(initDay, 0);
	
	//Schedule next update.
	if(dayUpdateTimeout != null) clearTimeout(dayUpdateTimeout);
	dayUpdateTimeout = setTimeout(dayUpdate, 24 * 60 * 60 * 1000 - initDate.getMilliseconds());
};

//day is a DayWeek object
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

//Called from update() when entering freetime or class time
const freeOrClassUpdate = function(day, nextTime) {
	//timetable update
	timetable.innerHTML = makeTimetableString(week[day], nextTime);
	rainbow.stopAll(); //Since we only need one rainbow-applied element in this document, it's safe to use stopAll().
	rainbow.start(document.getElementById("current"), 0);
	if(inFreetime) subject.innerHTML = "다음 시간은 " + week[day].subjects[nextTime] + " 시간입니다.";
	else subject.innerHTML = "지금은 " + week[day].subjects[nextTime] + " 시간입니다.";
};

const getTotalTime = function(day) {
	return week[day].entries[week[day].entries.length - 1].end;
};

/**Returns the current Entry atDay and atTime.
 * @param inDay {integer} - The day of the week in which to get the Entry.
 * @param atTime {integer} - The time from midnight in milliseconds at which to get the Entry.
 * @returns {integer} The index of that Entry in week[atDay].entries.
 * 0 if we're ahead of any Entry atTime. week[inday].entries.length if all Entries are finished atTime.*/
const getEntry = function(inDay, atTime) {
	const ent = week[inDay].entries; //Alias
	if(atTime < ent[0].start) return 0; //Ahead of any Entry atTime
	for(var i = 0;i < ent.length;i++) {
		if(ent[i].start <= atTime && atTime < ent[i].end) return i;
	}
	return ent.length; //All Entries finished atTime
};

/**Make necessary changes to the states and DOM.
 * @param day {integer} - The day of the week.
 * @param last {Entry} - The last Entry before the current one.
 * @param now {Entry} - The new Entry.
 * @param nowIndex {integer} - The index of now in week[day].entries.
 * @returns {integer} The subIndex of the next CLASS. week[day].subjects.length if there are no more classes.*/
const entryChanged = function(day, last, now, nowIndex) {
	if(now == null) { //No more Entries
		subject.innerHTML = "모든 수업이 끝났습니다.";
		remaining.innerHTML = "";
		totalTime.innerHTML = "";
		menuText.innerHTML = "";
		rainbow.stopAll();
		return week[day].subjects.length;
	}
	//Find the "next" class. The current class if now.type === CLASS
	const ent = week[day].entries; //Alias
	var nextClass = nowIndex;
	while(ent[nextClass].type !== Entry.Type.CLASS && nextClass < ent.length)
		nextClass++;
	if(last == null) {
		freeOrClassUpdate(day, ent[nextClass].subIndex);
	}
	else {
		//recess/class time switch
		if(last.type !== now.type && (last.type === Entry.Type.CLASS || now.type === Entry.Type.CLASS)) {
			if(now.type === Entry.Type.CLASS) {
				inFreetime = false;
				freeOrClassUpdate(day, now.subIndex);
			}
			else {
				inFreetime = true;
				if(nextClass < ent.length) //If a class exists after now
					freeOrClassUpdate(day, ent[nextClass].subIndex);
			}
		}
		//Change menuText to show the dinner after the lunchtime
		if(last.type === Entry.Type.MEAL) {
			if(Array.isArray(dinnerMenu) && dinnerMenu.length <= 0) //There is no dinner. Grey out menuText.
				menuText.style.color = backgroundList[backgroundNum].disabledColor;
			else
				menuText.innerHTML = makeMenuString(dinnerMenu);
		}
	}
	return nextClass < ent.length ? ent[nextClass].subIndex : week[day].subjects.length;
};

//main update function called every second
const update = function() {
	//Get current time
	var now = new Date();
	var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), day = now.getDay();
	time.innerHTML = h + "시 " + m + "분 " + s + "초";
	var physicalTime = ((h * 60 * 60) + (m * 60) + s) + bellError;
	//Get current Entry
	const index = getEntry(day, physicalTime);
	const entry = week[day].entries[index];
	//Handle changes in Entry
	if(lastEntry !== entry) {
		nextIndex = entryChanged(day, lastEntry, entry, index);
		lastEntry = entry;
	}
	//Check if all Entries are finished
	if(index === week[day].entries.length) return;
	
	//remaining time update
	var remain = entry.end - physicalTime;
	var remainString = inFreetime ? "다음 시간까지 " : "수업 종료까지 ";
	if(remain >= 60)
		remaining.innerHTML = remainString + Math.floor(remain / 60) + "분 " + (remain % 60) + "초 남았습니다.";
	else
		remaining.innerHTML = remainString + remain + "초 남았습니다.";
	
	//remaining total time update
	var end = totalPhysicalTime - physicalTime;
	totalTime.innerHTML = "일정 종료까지 <br>" + Math.floor(end / 3600) + "시간 " + Math.floor(end % 3600 / 60) + "분 " + end % 60 + "초";
};

//Construct DayWeek objects. Other properties will be assigned below while parsing.
for(var i  = 0;i < 7;i++) {
	week.push(new DayWeek(weekNames[i]));
}
fileReader.read("data.txt", function(data) {
	const words = fileReader.getTokensFrom(data);
	for(var index = 0;index < words.length;index++) { //Parse the file. Warning: index is modified inside the loop.
		switch(words[index]) {
		case "schedule":
			index += 2; //Skip "timeUnit"
			var unitChar = words[index++];
			var unitMin = unitChar === 'M' || unitChar === "minutes";
			while(words[index] !== "end") {
				var target = words[index]; //startTime, lunchTime, etc.
				if(week[0][target] !== undefined) { //The property has one scalar per DayWeek(startTime, lunchTime, lunchStart)
					for(var day = 0;day < 7;day++) {
						week[day][target] = parseInt(words[++index]);
						if(unitMin) week[day][target] *= 60;
					}
				}
				else if(Array.isArray(window[target])) { //The property is an array(classTime, restTime)
					index++;
					while(words[index] != "end") {
						window[target].push(parseInt(words[index++]));
						if(unitMin) window[target][window[target].length - 1] *= 60;
					}
				}
				else { //The property is a scalar(bellError)
					window[target] = parseInt(words[++index]);
					if(unitMin && target !== "bellError") window[target] *= 60; //Multiply by 60 to convert to seconds
				}
				index++; //Move to next target.
			}
			break;
			
		case "timetable":
			index += 2; //Jump to the first subject(or "end" if there is no subject on the first day(sunday)).
			for(var day = 0;day < 7;day++) {
				while(words[index] != "end") { //Save the subjects of a day of the week.
					week[day].subjects.push(words[index++]);
				}
				index += 2;
			}
			break;
			
		case "menuURL":
			menuURL = words[++index];
			break;
			
		case "backgrounds":
			index++;
			while(words[index] != "end") {
				backgroundList.push(new Background(words[index], words[index + 1], words[index + 2]));
				index += 3;
			}
			//Set initial background. Set backgroundNum to the max so it becomes 0 in the first changeBackground() call.
			backgroundNum = backgroundList.length - 1;
			changeBackground();
			break;
		}
	}
	//DEBUG
	const tempDate = new Date();
	const tempDay = tempDate.getDay();
	week[tempDay].startTime = tempDate.getHours() * 60 * 60 + tempDate.getMinutes() * 60 + tempDate.getSeconds() + 5
	week[tempDay].lunchTime = 5;
	week[tempDay].lunchStart = 3;
	week[tempDay].subjects = ["1", "2", "3", "4", "5"];
	classTime = [5, 5, 5, 5, 5], restTime = [5, 5, 5, 5, 5];
	
	//Generate entries. They will be naturally sorted.
	for(var day = 0;day < 7;day++) {
		var now = week[day].startTime;
		for(var i = 0;i < week[day].subjects.length;i++) {
			if(week[day].lunchStart === i - 1) {
				//Treat lunch as lunchTime + restTime. No RECESS if there is a lunch.
				week[day].entries.push(new Entry(Entry.Type.MEAL, now, now + week[day].lunchTime + restTime[i]));
				now += week[day].lunchTime + restTime[i];
			}
			else {
				week[day].entries.push(new Entry(Entry.Type.RECESS, now, now + restTime[i]));
				now += restTime[i];
			}
			week[day].entries.push(new Entry(Entry.Type.CLASS, now, now + classTime[i], i));
			now += classTime[i];
		}
	}
	
	getMenuData(menuURL, function(menu) {
		rawMenuCache = menu;
		dayUpdate();
	});
	dayUpdate(); //Call once to ensure totalPhysicalTime and date is updated even when menu is unavailable
});
//Empty the timetable once to prevent the placeholder in the HTML from appearing when all classes have already ended at startup.
timetable.innerHTML = "";
//Register the interval
setInterval(update, 1000);