//NOTE: this is a work in progress!
/*The goal is to create a player as a child process, 
controllable from the parent process.*/

const os = require('os');
const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path');
const audioFolder = './audio_tracks';
const musicFolder = '/home/pi/Music';
var tracks = Array();//TODO: store paths to audio tracks, not the files themselves.
var trackIndex = 0;
var currentTrack;
var numTracks = 0;
//TODO: store the  mp3s in ./audio_tracks in an array.
//TODO: play the first file.

//TODO: use jackd to configure the audio to play out of the headphone jack or hdmi (use parameters to detemine behaviour.)

/* NOTE: use "amixer cset numid=3 1" to set audio to headphone jack, 
 * use "amixer cset numid=3 2" to set audio to HDMI, or 
 * "amixer cset numid=3 0" to set to automatic
 **/


const findTracks = () => {
	console.log('findTracks function called.');
	var index = 0;
	fs.readdir(audioFolder, (err, files) => {
		files.forEach(file => {
			//console.log(file);
			//console.log('index of: ' + index);
			tracks.push(path.join(audioFolder, file));
			console.log('From findTracks(), the file path of track ' + index+1 + ' is: ' + tracks[index]);
			index += 1;
		});
	});
	if (!tracks) {
		console.log('No tracks in "./audio_tracks"');
		fs.readdir(musicFolder, (err, files) => {
			files.forEach(file => {
				//console.log(file);
				tracks.push(path.join(musicFolder, file));
				//console.log('file path is: ' + tracks[index]);
				index += 1;
			});
		});
	}
	numTracks = index + 1;
	if (!tracks) {
		console.log('No tracks to play, place tracks into ./audio_tracks or ~/Music.');
	}
	console.log('findTracks() found: ');
	tracks.forEach(track =>{console.log(track)});
	//return tracks;
};


function listTracks(){
	console.log('listTracks() called, listing tracks')
	if(!tracks){
		console.log('There are no tracks!');
		return;
	}
	tracks.forEach(track => {
			console.log(track);
		}
	);
}

findTracks();
listTracks();

//findTracks();//Uncomment to test.

const getNextTrackFrom = (pathToTrack) => {//Play only get get the next track.
	console.log('Play function called.');
	if (!pathToTrack) {
		//TODO: find tracks if param is null.
		tracks = findTracks();
	}
	
	if (tracks) {
		if(pathToTrack === currentTrack){
			if (tracks.length === 1) {
				console.log('Only one track to play.');
				currentTrack = tracks[trackIndex];
			} else if (currentTrack === tracks[tracks.length-1]){
				console.log('Reached the last file, starting over.');
				trackIndex = 0;
				currentTrack = tracks[trackIndex];
			} else {
				currentTrack = tracks[++trackIndex];
			}
		} else {
			console.log('invalid track path, trying to find a valid track.');
			findTracks();
		}
		console.log('Current track is: ' + currentTrack + ' at index ' + trackIndex + '.');

	} else {
		tracks = findTracks();
		currentTrack = tracks[0];
	}
	console.log('getNextTrackAt() found: ' + currentTrack);
	return currentTrack;	
};


//play(currentTrack);

//NOTE: console stdin/out/err is for debug purposes atm.
//console.log('spawning omxplayer globally.');
//const omxplayer = spawn('omxplayer', [currentTrack]);

const startPlayer = (pathToTrack) => {
	console.log('startPlayer function called.');
	//getNextTrackAt(pathToTrack);
	
	track = getNextTrackFrom(pathToTrack);
	
	console.log('In startPlayer(), starting with track ' + track);
	console.log('spawning omxplayer as child_process.');
	const omxplayer = spawn('omxplayer', [track]);
	
	omxplayer.stdout.on('data', (data) => {
		console.log(`rpi3 to omxplayer stdout.`);
		console.log(`${data}`);
	});

	omxplayer.stderr.on('data', (data) => {
		//TODO: catch and report errors
		console.log(`rpi3 to omxplayer stderr.`);
		console.log(`Error(s): ${data}`);
	});


	omxplayer.on('close', (code) => {
		//TODO: if omxplayer exits and there are no tracks, report.
		//TODO: if omxplayer exits and there is an array, loop over the array, and  play the next track
		//TODO: if omxplayer exits and there is only one song, loop.
		console.log(`omxplayer to omxplayer on 'close'`);
		console.log(`omxplayer ended with code ${code}`);
		if(code === 0){
			startPlayer();
		}
	});
}

//startPlayer();

//TODO: command line interpreter for cli only use.
//TODO: play() function.
//TODO: stop() function. (same as exit()).
//TODO: pauseOrResume() function.
//TODO: decrease speed function.
//TODO: increase speed function
//TODO: rewind() function
//TODO: showInfo() function
//TODO: previousAudioStream() function
//TODO: nextAudioStream() function
//TODO: previousChapter() function
//TODO: nextChapter() function
//TODO: exitOmxplayer() function (graceful exit)
//TODO: decreaseVolume() function
//TODO: increaseVolums() function
//TODO: seekBack30seconds() function(safe skip, checks to make sure that it won't skip past the beginning.
//TODO: seekAhead30Seconds() function (safe, makes sure to not skip past the end of the stream
//TODO: seekBack600seconds() (safe seek)
//TODO: seekAhead600seconds() (safe seek)
//TODO: check for tracks function.
//TODO: add tracks function.
//TODO: set number of audio channels function (max is 2)
//TODO: set audio route function with amixer.
