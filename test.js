//TODO: use a proper testing framework
function test() {
	var day = new Date().getDay();
	var inputD = [-4, 0, 1, 5, 9, 10, 16];
	var outputIndexD = [0, 0, 0, 0, 0, 1, 1];
	var outputStartD = [5, 5, 5, 5, 5, 15, 15];
	if(inputD.length !== outputIndexD.length) {
		console.log("Length mismatch");
		return;
	}
	for(var i = 0;i < inputD.length;i++) {
		var result = getNextTime(inputD[i], day);
		if(result.index !== outputIndexD[i]) {
			console.log("Test failed for index, time " + inputD[i]);
			console.log("Expected: " + outputIndexD[i]);
			console.log("Actual: " + result.index);
			return;
		}
		else if(result.startsAt !== outputStartD[i]) {
			console.log("Test failed for startsAt, time " + inputD[i]);
			console.log("Expected: " + outputStartD[i]);
			console.log("Actual: " + result.startsAt);
			return;
		}
	}
}
