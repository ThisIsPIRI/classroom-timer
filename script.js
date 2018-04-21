//TODO: refactor into a class(not necessarily an ES6 class)
//day information constructor
function DayWeek(n, start, lun, lunStart, sub) {
	this.name = n;
	//No optional arguments; we have to support IEs.
	this.startTime = start !== undefined ? start : 0;
	this.subjects = sub !== undefined ? sub : [];
	this.lunchTime = lun !== undefined ? lun : 0;
	this.lunchStart = lunStart !== undefined ? lunStart : 0;
}

//elements
const date = document.getElementById("date"), time = document.getElementById("time"), subject = document.getElementById("subject");
const remaining = document.getElementById("remaining"), timetable = document.getElementById("timetable");
const lunchMenu = document.getElementById("lunchMenu"), totalTime = document.getElementById("totalTime");
//other global variables
const weekNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
var inFreetime = undefined;
const week = []; //Where all day-specific information is stored
var classTime = [], restTime = []; //Not const because they have to be a property of window
var totalPhysicalTime = NaN; //The total duration of school in the day


var initDay;
const dayUpdate = function() {
	var initDate = new Date();
	initDay = initDate.getDay();
	date.innerHTML = initDate.getFullYear() + "년 " + (initDate.getMonth() + 1) + "월 " + initDate.getDate() + "일 " + weekNames[initDay];
	//Update the total time only if week has been initialized. If not, it will be updated after week gets initialized.
	if(week[initDay] != undefined) totalPhysicalTime = getTotalTime(initDay);
	//setTimeout(dayUpdate, 24 * 60 * 60 * 1000 - initDate.getMilliseconds()); Moved to update()
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

/**Returns the school time(as opposed to physical time) that (will have/had) passed at the start of (before)th recess-class pair.
 * @param {integer} before - The recess-class pair until the start of which you want to get the time.*/
const getSchoolTime = function(before) {
	var sum  = 0;
	for(var i = 0;i < before;i++) {
		sum += restTime[i] + classTime[i];
	}
	return sum;
};
const getTotalTime = function(day) {
	return week[day].startTime + week[day].lunchTime + getSchoolTime(week[day].subjects.length);
};

/**Returns the 0-based index of the next class at the given schoolTime AND the school time at which that class starts
 * in an Object as fields "index" and "startsAt".
 * Note that if schoolTime is inside a class, it will return the index of that class, and not the class next of it.
 * @param {integer} schoolTime - The school time for which you want to get the next class of.
 * @param {integer} day - The day in which to calculate the next class.*/
const getNextTime = function(schoolTime, day) {
	//Start from restTime[0] instead of 0 because Math.floor(-1 / 2) === 0
	if(schoolTime <= restTime[0]) return {index: 0, startsAt: restTime[0]};
	var sum = restTime[0], i;
	for(i = 1;i < week[day].subjects.length * 2;i++) {
		if(i % 2 === 0) sum += restTime[Math.floor(i / 2)]; //The first recess comes before the first class.
		else sum += classTime[Math.floor(i / 2)];
		if(sum > schoolTime) break;
	}
	//Since we're calculating the time THIS class starts if we're currently in a class(in other words, i % 2 !== 0 at the end),
	//we have to subtract the duration of this class from sum; it would point to the start of the next RECESS without doing so.
	return {index: Math.floor(i / 2), startsAt: i % 2 === 0 ? sum : sum - classTime[Math.floor(i / 2)]};
};

//main update function called every second
const update = function() {
	//Get the current time
	var now = new Date();
	var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), day = now.getDay();
	time.innerHTML = h + "시 " + m + "분 " + s + "초";
	if(day !== initDay) dayUpdate();

	//Core calculations
	var physicalTime = ((h * 60 * 60) + (m * 60) + s) + bellError;
	var schoolTime = physicalTime - week[day].startTime;
	var schoolLunchStart = getSchoolTime(week[day].lunchStart + 1);
	if(schoolTime > schoolLunchStart) schoolTime -= Math.min((schoolTime - schoolLunchStart), week[day].lunchTime);
	var nextTime = getNextTime(schoolTime, day);
	var nextIndex = nextTime.index;
	var nextStartTime = nextTime.startsAt + week[day].startTime;
	if(nextIndex > week[day].lunchStart)
		nextStartTime += week[day].lunchTime;
	var remain = nextStartTime - physicalTime;
	
	//Check if all classes are finished
	if(week[day].subjects[nextIndex] === undefined) {
		subject.innerHTML = "모든 수업이 끝났습니다.";
		remaining.innerHTML = "";
		totalTime.innerHTML = "";
		lunchMenu.innerHTML = "";
		rainbow.stopAll();
		return;
	}
	
	//freetime/class time switch
	if((remain >= 0) != inFreetime) { //When remain is positive or 0, it's freetime. Otherwise, it's class time.
		inFreetime = remain >= 0;
		freeOrClassUpdate(day, nextIndex);
	}
	
	//remaining time update
	var remainString, displayedRemainTime;
	if(inFreetime) {
		remainString = "다음 시간까지 ";
		displayedRemainTime = remain;
	}
	else {
		remainString = "수업 종료까지 ";
		displayedRemainTime = classTime[nextIndex] + remain; //The remaining seconds for this class. Since remain === -(All seconds from the start of this class), we add remain to classTime.
	}
	if(displayedRemainTime >= 60)
		remaining.innerHTML = remainString + Math.floor(displayedRemainTime / 60) + "분 " + (displayedRemainTime % 60) + "초 남았습니다.";
	else
		remaining.innerHTML = remainString + displayedRemainTime + "초 남았습니다.";
	
	//remaining total time update
	var end = totalPhysicalTime - physicalTime;
	totalTime.innerHTML = "일정 종료까지 <br>" + Math.floor(end / 3600) + "시간 " + Math.floor(end % 3600 / 60) + "분 " + end % 60 + "초";
	
	//gray out the lunch menu after the lunchtime
	if((week[day].startTime + getSchoolTime(week[day].lunchStart + 1) + week[day].lunchTime / 3) - physicalTime < 0)
		lunchMenu.style.color = backgroundList[backgroundNum].disabledColor;
	
	//debug
	//console.log("nextIndex : " + nextIndex + ", nextStartTime : " + nextStartTime + ", remain : " + remain + ", displayedRemainTime : " + displayedRemainTime);
};

dayUpdate();

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
			
		case "lunchURL":
			lunchURL = words[++index];
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
	week[initDay].startTime = tempDate.getHours() * 60 * 60 + tempDate.getMinutes() * 60 + tempDate.getSeconds() + 5
	week[initDay].lunchTime = 10;
	week[initDay].lunchStart = 3;
	week[initDay].subjects = ["1", "2", "3", "4", "5"];
	classTime = [5, 5, 5, 5, 5], restTime = [5, 5, 5, 5, 5];
	
	totalPhysicalTime = getTotalTime(initDay);
});
//getLunchData(function(menu) {lunchMenu.innerHTML = makeLunchString(menu);}); //Fetch the lunch menu and display it.
//Update the timetable once to prevent the placeholder in the HTML from appearing when all classes have already ended at startup.
timetable.innerHTML = makeTimetableString(week[initDay], 2100000000);
//Register the interval
setInterval(update, 1000);