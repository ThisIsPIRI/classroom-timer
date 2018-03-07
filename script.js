//update these to override the default timetable
const temporaryStart = NaN, temporaryLunch = NaN, temporaryLunchStart = NaN;
const temporarySubject = NaN;
const temporaryClass = NaN, temporaryRest = NaN;
//testing
/*const tempDate = new Date();
const temporaryStart = tempDate.getHours() * 60 * 60 + tempDate.getMinutes() * 60 + tempDate.getSeconds() + 5, temporaryLunch = 10, temporaryLunchStart = 3;
const temporarySubject = ["1", "2", "3", "4", "5"];
const temporaryClass = 5, temporaryRest = 5;*/

//day information constructor
function dayWeek(n, start, lun, lunStart, sub) {
	this.name = n;
	this.startTime = start;
	this.subjects = sub;
	this.lunchTime = lun;
	this.lunchStart = lunStart;
}

//default timetable
let subjects = [[], ["월요", "병을", "이기", "는법", "오교", "시부", "터"],
		["화요일", "시간표"],
		["수요일", "시간표"],
		["목요일", "시간표"],
		["금요일", "시간표"], []];
let weekNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
let startTimes = [0, 32400, 31800, 31200, 31800, 31800, 0];
let lunchTimes = [0, 3000, 3000, 2400, 3000, 3000, 0]; //theoretically every class has a preceding freetime. lunch time is not considered a freetime so -10min from lunch times to simulate freetimes preceding fifth class.
let lunchStarts = [0, 3, 3, 3, 3, 3, 0];
let classTime = 2700, restTime = 600;

//global variables
var inFreetime = undefined;
const date = document.getElementById("date"), time = document.getElementById("time"), subject = document.getElementById("subject");
const remaining = document.getElementById("remaining"), timetable = document.getElementById("timetable");
const lunchMenu = document.getElementById("lunchMenu"), totalTime = document.getElementById("totalTime");
const minute1 = new Audio("1minute.mp3"), classStarted = new Audio("classStarted.mp3");
var week = [];

//day : a dayWeek object as arguments
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
//main update function called every second
const update = function() {
	//time update
	var now = new Date();
	var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), day = now.getDay();
	time.innerHTML = h + "시 " + m + "분 " + s + "초";

	//variables update
	var physicalTime = ((h * 60 * 60) + (m * 60) + s) + 4 //constant difference from the bell
	var schoolTime = physicalTime - week[day].startTime;
	var schoolLunchStart = (classTime + restTime) * (week[day].lunchStart + 1);
	if(schoolTime > schoolLunchStart) schoolTime -= Math.min((schoolTime - schoolLunchStart), week[day].lunchTime);
	var nextTime = Math.max(0, parseInt(schoolTime / (classTime + restTime)));
	var nextStartTime = (classTime + restTime) * (nextTime) + week[day].startTime + restTime;
	if(nextTime > week[day].lunchStart)
		nextStartTime += week[day].lunchTime;
	var remain = nextStartTime - physicalTime;
	
	//Check if all classes are finished
	if(week[day].subjects[nextTime] === undefined) {
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
		freeOrClassUpdate(day, nextTime);
	}
	
	//remaining time update
	var remainString, displayedRemainTime;
	if(inFreetime) {
		remainString = "다음 시간까지 ";
		displayedRemainTime = remain;
	}
	else {
		remainString = "수업 종료까지 ";
		displayedRemainTime = classTime + remain; //The remaining seconds for this class. Since remain === -(All seconds from the start of this class), we add remain to classTime.
	}
	if(displayedRemainTime >= 60)
		remaining.innerHTML = remainString + parseInt(displayedRemainTime / 60) + "분 " + (displayedRemainTime % 60) + "초 남았습니다.";
	else
		remaining.innerHTML = remainString + displayedRemainTime + "초 남았습니다.";
	
	//remaining total time update
	var end = week[day].startTime + week[day].lunchTime + week[day].subjects.length * (classTime + restTime) - physicalTime;
	totalTime.innerHTML = "일정 종료까지 <br>" + parseInt(end / 3600) + "시간 " + parseInt(end % 3600 / 60) + "분 " + end % 60 + "초";

	//play sounds. TODO: replace with a list of playing times traversed sequentially
	if(remain === 120) sound.repeat(sound.beep, 2);
	if(remain === 61) minute1.play();
	if(remain === 0) classStarted.play();
	
	//gray out the lunch menu after the lunchtime
	if((week[day].startTime + (week[day].lunchStart + 1) * (classTime + restTime) + week[day].lunchTime / 3) - physicalTime < 0)
		lunchMenu.style.color = backgroundList[backgroundNum].disabledColor;
	
	//debug
	//console.log("nextTime : " + nextTime + ", nextStartTime : " + nextStartTime + ", remain : " + remain + ", displayedRemainTime : " + displayedRemainTime);
};
var initDay;
const dayUpdate = function() {
	var initDate = new Date();
	initDay = initDate.getDay();
	date.innerHTML = initDate.getFullYear() + "년 " + (initDate.getMonth() + 1) + "월 " + initDate.getDate() + "일 " + weekNames[initDay];
	getLunchData();
	setTimeout(dayUpdate, 24 * 60 * 60 * 1000 - initDate.getMilliseconds());
};
dayUpdate();

//override the default timetable if a temporary timetable exists
if(!isNaN(temporaryStart))
	startTimes[initDay] = temporaryStart;
if(!isNaN(temporaryLunch))
	lunchTimes[initDay] = temporaryLunch;
if(!isNaN(temporaryLunchStart))
	lunchStarts[initDay] = temporaryLunchStart;
if(!isNaN(temporarySubject))
	subjects[initDay] = temporarySubject;
if(!isNaN(temporaryClass))
	classTime = temporaryClass;
if(!isNaN(temporaryRest))
	restTime = temporaryRest;

//construct dayWeek objects
for(var i  = 0;i < 7;i++) {
	week.push(new dayWeek(weekNames[i], startTimes[i], lunchTimes[i], lunchStarts[i], subjects[i]));
}
//register the interval
setInterval(update, 1000);