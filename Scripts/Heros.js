function Heros(x, y, forme='rond') {
	this.shifting = false;
	this.forme = forme;
	this.pts_coll = { 'bas': {'x': 0, 'y': 10}, 'haut': {'x': 0, 'y': -10}, 'gauche': {'x': -10, 'y': 0}, 'droite': {'x': 10, 'y': 0}};
	
	this.shape = stage.addChild(new createjs.Shape());
	this.shape.x = x;
	this.shape.y = y;
	
	this.shapeShift();
	
	this.collision = {};
}

Heros.prototype.canShift = function() {
	return this.shifting;
}

Heros.prototype.isSwitching = function() {
	return this.switchDir !== undefined;
}
Heros.prototype.getSwitchDir = function() {
	return this.switchDir;
}
Heros.prototype.setSwitchDir = function(dir) {
	this.switchDir = dir;
}

Heros.prototype.isOutOfBounds = function() {
	var b = ecran.getBounds();
	
	if (this.shape.x > b.droite) { 
		this.setSwitchDir('droite');
	} else if (this.shape.x < b.gauche) { 
		this.setSwitchDir('gauche');
	} else if (this.shape.y > b.bas) {
		this.setSwitchDir('bas');
	} else if (this.shape.y < b.haut) { 
		this.setSwitchDir('haut');
	}
	return this.isSwitching();
}

Heros.prototype.move = function(dir, t) {
	this.collision[dir] = moteur.checkCollision(this.pts_coll[dir]);
	
	if (!this.collision[dir]) {
		switch(dir) {
			case 'haut':
				this.shape.y -= moteur.timeSpent(t) * config.vitesse.saut;
				break;
			case 'bas':
				moteur.initWaitJump();
				this.shape.y += moteur.timeSpent(t) * config.vitesse.chute;
				break;
			case 'gauche':
				this.shape.x -= moteur.timeSpent(t) * config.vitesse.deplacement;
				break;
			case 'droite':
				this.shape.x += moteur.timeSpent(t) * config.vitesse.deplacement;
				break;
		}
		
		//console.log(this.shape.x + ' ' + this.shape.y);
	}
	
	this.collision[dir] = moteur.checkCollision(this.pts_coll[dir]);
	
	if (this.collision[dir]) {
		switch(dir) {
			case 'haut':
				this.jump = false;
				this.shape.y = this.collision[dir].graphics.command.y + this.collision[dir].graphics.command.h - this.pts_coll[dir].y;
				break;
			case 'bas':
				this.shape.y = this.collision[dir].graphics.command.y - this.pts_coll[dir].y;
				break;
			case 'gauche':
				this.shape.x = this.collision[dir].graphics.command.x + this.collision[dir].graphics.command.w - this.pts_coll[dir].x;
				break;
			case 'droite':
				this.shape.x = this.collision[dir].graphics.command.x - this.pts_coll[dir].x;
				break;
		}
	}
}

Heros.prototype.isJumping = function() {
	return this.jump;
}

Heros.prototype.canJump = function() {
	this.collision['bas'] = moteur.checkCollision(this.pts_coll['bas']);
	if (this.collision['bas']) {
		this.jump = !moteur.waitJump();
		return true;
	} else {
		return false;
	}
}

Heros.prototype.shapeShift = function() {
	this.shape.graphics.clear();
	
	switch(this.forme) {
		case 'carre':
			this.shape.graphics.beginFill("red").drawRect(-10, -10, 20, 20);
			current_forme = 'carre';
			break;
		case 'rond':
			this.shape.graphics.beginFill("blue").drawCircle(0, 0, 10);
			current_forme = 'rond';
			break;
		case 'triangle':
			// TODO
			break;
	}
}

Heros.prototype.nextShape = function() {
	switch(this.forme) {
		case 'carre':
			this.forme = 'rond';
			break;
		case 'rond':
			this.forme = 'carre';
			break;
		case 'triangle':
			// TODO
			break;
	}
	
	this.shapeShift();
}