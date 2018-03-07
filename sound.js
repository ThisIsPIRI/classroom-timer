const sound = {
	repeatNumber : 0,
	repeatInternal : function() {
		if(sound.repeatNumber === 0) return;
		sound.audio.onended = sound.repeatInternal;
		sound.repeatNumber--;
		sound.audio.play();
	},
	repeat : function(what, howMany) {
		sound.audio = what;
		sound.repeatNumber = howMany;
		sound.repeatInternal();
	}
}