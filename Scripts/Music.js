var music_instance;

function stopMusic() {
	createjs.Sound.stop();
}

function playMusic(format) {
	var position; 
	if (music_instance) position = this.getMusicTime();
	createjs.Sound.stop();
	music_instance = createjs.Sound.play(musics[format][current_music], {loop: -1}); //+ 'carre'
	music_instance.volume = 0.2;
	music_instance.setPosition(position ? position : 0);
}

function handleComplete() {
	music_instance.setPosition(position ? position : 0);
}

function playSound(id) {
	createjs.Sound.play(musics[format][id]);
}

function getMusicTime() {
	return music_instance.getPosition();
}