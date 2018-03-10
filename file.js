//An object literal for reading local files in local web apps.
const fileReader = {
	read : function(fileName, callback) {
		const request = new XMLHttpRequest();
		request.open("GET", fileName, true);
		request.responseType = "text";
		request.onload = function() {
			callback(request.responseText);
		}
		request.send(null);
	}
};