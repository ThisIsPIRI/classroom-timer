//TODO: refactor into a class(not necessarily an ES6 class)
//TODO: generalize lunch handling to support three or more meals per day
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
const DayWeek = function(n, start, lun, lunStart, sub, ent, vars) {
	this.name = n;
	//No optional arguments; we might have to support IEs.
	this.startTime = start != undefined ? start : 0;
	this.subjects = sub != undefined ? sub : [];
	this.entries = ent != undefined ? ent : [];
	this.lunchTime = lun != undefined ? lun : 0;
	this.lunchStart = lunStart != undefined ? lunStart : 0;
	this.varSlots = vars != undefined ? vars : [];
}

//elements
const date = document.getElementById("date"), time = document.getElementById("time"), subject = document.getElementById("subject");
const remaining = document.getElementById("remaining"), timetable = document.getElementById("timetable");
const menuText = document.getElementById("menuText"), totalTime = document.getElementById("totalTime");
//State variables for update()
var inFreetime = null;
var lastEntry = null;
//other variables
const weekNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const week = []; //Where all day-specific information is stored
var classTime = [], restTime = []; //Not const because they have to be a property of window
var bellError = 0; //By how many seconds the bell is ahead of the actual time
var totalPhysicalTime = NaN; //The total duration of school in the day
var menuURL = null; //The URL to fetch the menus from
var rawMenuCache = ""; //The content of menu webpage
var lunchMenu = [], dinnerMenu = [];
var lastDate = -1; //Used to determine whether to call dayUpdate or not
var varStart = null;
var varSubjects = [];
var cycleBackgrounds = false; //Whether to automatically cycle the backgrounds at certain times
var cycleVars = false; //Whether to cyclically add the variable subject after the end of the list is reached
const MENU_LIMIT = 9;
const bgManager = new BgManager(document.getElementsByTagName("body")[0], document.getElementById("imageAuthor"));

//Delegate calls from "change background" button's onclick
const changeBackground = () => bgManager.changeBackground.call(bgManager);
/**Updates variables after a change in the current day. Must be called AFTER ajaxRequester callback.*/
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

	//Fill today's variable subject slots.
	fillVars(initDate);

	//Update the timetable.
	freeOrClassUpdate(initDay, 0);

	//Set initial background. Set bgManager.curIdx to the max so it becomes 0 in the first changeBackground() call.
	//Needed in dayUpdate() to reset the background if it's set to cycle.
	bgManager.curIdx = bgManager.bgList.length - 1;
	bgManager.changeBackground();

	//Cache and update the menu. Placed last due to being the most error-prone part.
	//TODO: update menuURL and fetch the menu again if the month has changed
	const descLength = function(a, b) { //Comparison function to sort strings by descending order of their length
		return b.length - a.length;
	}
	lunchMenu = parseRawMenu(rawMenuCache, initDate.getDate(), MenuType.LUNCH).sort(descLength);
	dinnerMenu = parseRawMenu(rawMenuCache, initDate.getDate(), MenuType.DINNER).sort(descLength);
	menuText.innerHTML = makeMenuString(lunchMenu, MENU_LIMIT);

	//Make the menu visible again, in case it was greyed out.
	menuText.className = "enabled";
};

/**Fills the supplied date's variable subject slots.
 * @param today {Date} - The Date to fill in. It will not be modified.*/
const fillVars = function(today) {
	today = new Date(today);
	today.setHours(0, 0, 0, 0);
	var varDate = new Date(varStart);
	varDate.setHours(0, 0, 0, 0);
	var sum = 0;
	for(;today - varDate !== 0;varDate.setDate(varDate.getDate() + 1)) {
		sum += week[varDate.getDay()].varSlots.length;
	}
	for(var i = 0;i < week[today.getDay()].varSlots.length;i++, sum++) {
		if(cycleVars && sum >= varSubjects.length)
			sum %= varSubjects.length;
		week[today.getDay()].subjects[week[today.getDay()].varSlots[i]] = varSubjects[sum];
	}
}

//Called from update() when entering freetime or class time
const freeOrClassUpdate = function(day, nextTime) {
	//timetable update
	timetable.innerHTML = makeTimetableString(week[day].subjects, nextTime);
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
	if(ent.length <= 0) return 0; //No Entries today
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
	inFreetime = now.type !== Entry.Type.CLASS; //Set this manually every time; the timer may be started after the first recess.
	if(last == null) {
		freeOrClassUpdate(day, ent[nextClass].subIndex);
		//Update to dinner when started after the lunchtime.
		if(ent[nextClass].subIndex > week[day].lunchStart && now.type !== Entry.Type.MEAL)
			lunchEnd();
	}
	else {
		//recess/class time switch
		if(last.type !== now.type && (last.type === Entry.Type.CLASS || now.type === Entry.Type.CLASS)) {
			if(now.type === Entry.Type.CLASS)
				freeOrClassUpdate(day, now.subIndex);
			else if(nextClass < ent.length) //If a class exists after now
				freeOrClassUpdate(day, ent[nextClass].subIndex);
		}
		//Change menuText to show the dinner after the lunchtime
		if(last.type === Entry.Type.MEAL)
			lunchEnd();
	}
	return nextClass < ent.length ? ent[nextClass].subIndex : week[day].subjects.length;
};

/**Updates menuText for dinner or greys it out if dinnerMenu is empty.*/
const lunchEnd = function() {
	if(!Array.isArray(dinnerMenu) || dinnerMenu.length <= 0) //There is no dinner. Grey out menuText.
		menuText.className = "disabled";
	else
		menuText.innerHTML = makeMenuString(dinnerMenu, MENU_LIMIT);
}

//main update function called every second
const update = function() {
	//Get current time
	var now = new Date();
	if(lastDate !== now.getDate()) {
		lastDate = now.getDate();
		dayUpdate();
	}
	var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), day = now.getDay();
	time.innerHTML = h + "시 " + m + "분 " + s + "초";
	var physicalTime = ((h * 3600) + (m * 60) + s) + bellError;
	//Get current Entry
	const index = getEntry(day, physicalTime);
	const entry = week[day].entries[index];
	//Handle changes in Entry
	if(lastEntry !== entry) {
		entryChanged(day, lastEntry, entry, index);
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
//TODO: use the parsing function below to make something that can convert current data.txt to JSON and remove it from here
ajaxRequester.request("data.txt", function(data) {
	const words = ajaxRequester.getTokensFrom(data);
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
						if(unitMin && target !== "lunchStart") week[day][target] *= 60;
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
				var vsi = 0; //Variable slot index
				while(words[index] != "end") { //Save the subjects of a day of the week.
					const subject = words[index++];
					if(subject.toUpperCase() === "VAR") week[day].varSlots.push(vsi);
					week[day].subjects.push(subject);
					vsi++;
				}
				index += 2;
			}
			break;

		case "variables":
			varStart = new Date(parseInt(words[index + 1]), parseInt(words[index + 2]) - 1, parseInt(words[index + 3]));
			index += 3;
			while(words[++index] !== "end") {
				if(words[index].toUpperCase() === "CYCLE") {
					cycleVars = true;
					continue;
				}
				varSubjects.push(words[index]);
			}
			break;

		case "menuURL":
			if(words[++index].toUpperCase() === "ADDDATE") {
				const menuDate = new Date();
				menuURL = words[++index] + menuDate.getFullYear() + ("0" + (menuDate.getMonth() + 1)).slice(-2);
			}
			else menuURL = words[index];
			break;

		case "backgrounds":
			index++;
			while(words[index] != "end") {
				const bg = new Background(words[index], words[index + 1], words[index + 2]);
				index += 3;
				//Read the author if there is one
				if(words[index].toUpperCase() !== "NONE") {
					bg.author = "";
					while(words[index] !== "end") bg.author += words[index++] + ' ';
				}
				index++;
				bgManager.bgList.push(bg);
			}
			if(words[++index] === "cycle") {
				cycleBackgrounds = true;
				index++;
				bgManager.bgList[0].setAt = 0;
				for(var i = 1;i < bgManager.bgList.length;i++) {
					bgManager.bgList[i].setAt = milFromMidnight(parseInt(words[index++]), parseInt(words[index++]));
				}
			}
			break;
		}
	}
	//DEBUG
	/*const tempDate = new Date();
	const tempDay = tempDate.getDay();
	week[tempDay].startTime = tempDate.getHours() * 60 * 60 + tempDate.getMinutes() * 60 + tempDate.getSeconds() + 2
	week[tempDay].lunchTime = 3;
	week[tempDay].lunchStart = 1;
	week[tempDay].subjects = ["1", "2", "3", "4"];
	classTime = [5, 5, 5, 5], restTime = [5, 5, 5, 5];
	bgManager.bgList[1].setAt = milFromMidnight(tempDate.getHours(), tempDate.getMinutes(), tempDate.getSeconds() + 35);*/
	
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

	getMenuData(menuURL, function(menu) { //Called regardless of if the request succeeds or not, unless it is aborted.
		rawMenuCache = menu;
		//Finally, set an interval for the main update function.
		setInterval(update, 1000);
	});
});
//Empty the timetable once to prevent the placeholder in the HTML from appearing when all classes have already ended at startup.
timetable.innerHTML = "";