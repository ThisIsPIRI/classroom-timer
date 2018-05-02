# Classroom Timer
A web-based timer for classrooms. May not be accurate or up-to-date. Use with Chrome and the arguments --disable-web-security and --user-data-dir is recommended.

## Features
- Display the current time, current/next subject, how much time is left before the next class/recess/end of all classes and<del>, most importantly,</del> today's lunch menu. You have to manually set the URL to fetch the menu from before the lunch menu can be displayed.
- Play sound some time before the class/recess starts. Unfortunately, no sound is included; you have to insert your own.

## Dependencies
Requires rainbow.js and file.js from [my JS Library](https://github.com/ThisIsPIRI/js-library). Put them in lib directory.

## The format
When you're writing data files for the timer, you have to follow a certain format. The file consists of 4 sections: schedule, timetable, lunchURL and backgrounds. A literal 'end' MUST be the last token of a section. The order of the sections doesn't matter. You can use either spaces or newlines to separate tokens. Comments can be written outside of the 5 main sections.

### schedule
Under schedule, you need 7 things:

- timeUnit, the unit of time used(M/minutes or S/seconds);
- startTime, the time the first recess(before the first class) starts;
- lunchTime, the length of the lunchtime minus 10 minutes;
- lunchStart, the class after which the lunchtime starts;
- classTime, the length of each classes;
- restTime, the length of each recesses; and
- bellError, the error of your classroom's bell system(by how many seconds it is ahead of the actual time).

Their names must be exactly the same as written above. timeUnit MUST come first, and the orders of other fields don't matter.

startTime, lunchTime and lunchStart must be followed by 7 integers, each for a day, starting in Sunday.

classTime and restTime must be followed by (max # of classes in a day - 1) integers, representing the duration of each classes and recesses BEFORE them. They must have an 'end' at the end.

bellError is a single integer, and it must be in seconds, regardless of timeUnit. It is not essential and can be omitted, in which case it defaults to 0.

One important thing to note is that, theoretically, every class has a preceding recess. lunchTimes are not considered a recess; thus, you MUST subtract 10 minutes from lunch times to simulate recesses preceding the class after lunch(usually fifth). At the very end, put an 'end'.

### timetable
Under timetable, you put the names of the 7 days, the names of the subjects in each days after them, and one 'end' in the end of each days. The spelling of the days doesn't matter, but they MUST have one 'end' at the end of their lines; this is because the number of subjects is variable. Put an 'end' at the end of the section, too.

If the subject inside a slot varies each week, write a literal 'var' instead of a subject name and fill it below. The case of 'var' doesn't matter.

### variables
variables is where you fill 'var's in the timetable. Under "variables", write a number specifying the year, month and day the list below starts in. After that, start writing the subjects in ascending order of their days. This section isn't needed if you don't have any variable subject slots.

If you want the variable subjects to cyclically enter the timetable, write "cycle" right before "end". The case doesn't matter. Because of this, the word "cycle" can't be used as a name of a variable subject.

### menuURL
menuURL is simple: write menuURL, the URL to fetch the menu from(including the protocol - http://), and the necessary 'end'.

### backgrounds
Under the last section, backgrounds, you write the name of the background image, the color of texts when they are enabled over the background, the color of them when they're disabled and the optional person/organization/whatever to credit the image to. The file must be in the same directory as the HTML.

For the colors, you can use anything CSS accepts: color names, rgb or hsl for example. Since spaces separate tokens in this file, one color or filename MUST NOT contain any spaces. Example: rgb(255, 255, 255) cannot be used, while rgb(255,255,255) can. Don't write semicolons at the end of them.

If you don't want to credit someone, write 'none' as the fourth word. Because of this, you can't use 'none' as the first word of the author. The case doesn't matter. Each background must have 'end' at the end, except when the author is 'none'. Write an 'end' after all backgrounds.

If you want to cycle backgrounds as time goes by, write "cycle" after the last background and write the hour(0-23) and minute(0-59) at which the background should change for all backgrounds except the first one, which is displayed before any change. The order of backgrounds and times must match. When you're finished, don't forget to put an 'end' at the end of the section, too.