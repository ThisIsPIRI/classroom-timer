const INTERVAL = 2000;
const cycleEntries = function() {
	var last = new Date();
	last.setHours(0, 0, 0, 0);
	const midnight = new Date(last);
	MockDate.set(last);
	var i = 0;
	const inner = function() {
		if(i === week[last.getDay()].entries.length) {
			midnight.setDate(midnight.getDate() + 1);
			last = new Date(midnight);
			i = 0;
			MockDate.set(last);
		}
		else {
			const entry = week[last.getDay()].entries[i];
			const to = new Date(midnight.getTime() + (entry.start * 1000));
			MockDate.set(to);
			last = to;
			i++;
		}
		setTimeout(inner, INTERVAL);
	};
	setTimeout(inner, INTERVAL);
}