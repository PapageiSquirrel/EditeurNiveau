function FrameCounter(nb_frames, onactivate) {
	this.actif = false;
	this.nb_frames = nb_frames;
	this.counter = 0;
	
	this.onactivate = onactivate;
}

FrameCounter.prototype.activate = function() {
	this.actif = true;
	this.counter = 0;
	
	if (this.onactivate) this.onactivate();
}

FrameCounter.prototype.increment = function() {
	this.counter++;
}

FrameCounter.prototype.reset = function() {
	this.counter = 0;
	this.actif = false;
}

FrameCounter.prototype.isFirstFrame = function() {
	return this.counter === 1;
}

FrameCounter.prototype.isLastFrame = function() {
	return this.counter === this.nb_frames;
}