// Media Player using HTML5's Media API
function initialiseMediaPlayer() {
	// Get handles to each of the buttons and required elements
	playPauseBtn = $('#play')[0];
	muteBtn = $('#mute')[0];

	// Hide the browser's default controls
	mediaSound.controls = false;

	mediaSound.oncanplaythrough = function() {
		if (seek || currentEnd_loadSecond) {
			seek = false;
			currentEnd_loadSecond = false;
			mediaSound.play();
		}
	};
	mediaSound.onplay = function() {
		if (videoJson.audios.length > 0) {
			if (fullMode) {
				showOp();
				if (!viewsWasIncrement) {
					incrementViewes();
				}
			}
			changeButtonType(playPauseBtn, 'pause');
			starttimeMS = new Date();

			if (resttimeMS < 1000 && resttimeMS > 0) {
				setTimeout(doEverySecond, resttimeMS);
			}
			if (interval == null) {
				interval = setInterval(doEverySecond, 1000);
			}
		} else {
			console.error('Error: there is no mp3 in the json-audios to play!');
			mediaSound.pause();
		}
	};
	mediaSound.onpause = function() {
		if (fullMode)
			showOp();
		changeButtonType(playPauseBtn, 'play');
		clearInterval(interval);
		interval = null;
		endtimeMS = new Date();
		totaltimeMS = endtimeMS - starttimeMS;
		resttimeMS = 1000 - ((endtimeMS - starttimeMS) % 1000);
	};
	mediaSound.onended = function() {
		console.log("onended");
		audio_timeCounter++;

		// If thare are more videos
		if (audio_timeCounter < videoJson.audios.length) {

			// Change audio-source & Load func & Play func
			playAudio_withSeek(0, true);
			currentEnd_loadSecond = true;
		} else {
			// video has finished, 
			if (fullMode)
				showOp('end');
			//init param:
			clearInterval(interval);
			interval = null;
			audio_timeCounter = 0;
			video_timeCounter = 0;
		}
	};
	mediaSound.onerror = function(e) {
		alert("Error! Something went wrong");
		alert("Cannot play video because load failed.");
	};
	mediaSound.onvolumechange = function() {
		// Update the button to be mute/unmute
		if (mediaSound.muted)
			changeButtonType(muteBtn, 'unmute');
		else
			changeButtonType(muteBtn, 'mute');
	};
}