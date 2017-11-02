var music_instance;

function stopMusic() {
	createjs.Sound.stop();
}

function playMusic(format) {
	var position; 
	if (music_instance) position = this.getMusicTime();
	createjs.Sound.stop();
	music_instance = createjs.Sound.play(musics[format][current_music + heros.forme]);
	music_instance.setPosition(position ? position : 0);
}

function playSound(id) {
	createjs.Sound.play(musics[format][id]);
}

function getMusicTime() {
	return music_instance.getPosition();
}