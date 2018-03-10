# Classroom Timer
A web-based timer for classrooms. May not be accurate or up-to-date. Use with Chrome and the arguments --disable-web-security and --user-data-dir is recommended.

## Features
- Display the current time, current/next subject, how much time is left before the next class/recess/end of all classes and<del>, most importantly,</del> today's lunch menu. You have to manually set the URL to fetch the menu from before the lunch menu can be displayed.
- Play sound some time before the class/recess starts. Unfortunately, no sound is included; you have to insert your own.

## The format
When you're writing data files for the timer, you have to follow a certain format. The file consists of 4 sections: schedule, timetable, lunchURL and backgrounds. A literal 'end' MUST be the last token of a section. The order of the sections doesn't matter. You can use either spaces or newlines to separate tokens. Comments can be written outside of the 4 main sections.

Under schedule, you need 5 things:

- startTime, the time the first recess(before the first class) starts;
- lunchTime, the length of the lunchtime minus 10 minutes;
- lunchStart, the class after which the lunchtime starts;
- classTime, the length of each classes; and
- restTime, the length of each recesses.

All times are in seconds from the midnight. Their names must be exactly the same as written above. The first 3 of them must be followed by 7 integers, each for a day, starting in Sunday. classTime and restTime are both single integers now, but it will be changed (hopefully) soon. One important thing to note is that theoretically, every class has a preceding recess. lunchTimes are not considered a recess; thus, you MUST subtract 10 minutes from lunch times to simulate recesses preceding the class after lunch(usually fifth). At the very end, put an 'end'.

Under timetable, you put the names of the 7 days, the names of the subjects in each days after them, and one 'end' in the end of each days. The spelling of the days doesn't matter, but they MUST have one 'end' at the end of their lines; this is because the number of subjects is variable. Put an 'end' at the end of the section, too.

lunchURL is simple; write lunchURL, the URL to fetch the menu from, and the necessary 'end'.

Under the last section, backgrounds, you write the name of the background image, the color of texts when they are enabled over the background, and the color of them when they're disabled. The file must be in the same directory as the HTML. For the colors, you can use anything CSS accepts: color names, rgb or hsl for example. Since spaces separate tokens in this file, one color or filename MUST NOT contain any spaces. Example: rgb(255, 255, 255) cannot be used, while rgb(255,255,255) can. Don't write semicolons at the end of them. When you're finished, don't forget to put an 'end' at the end.