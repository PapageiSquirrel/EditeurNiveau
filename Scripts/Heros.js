function Heros(f=forme.Rond) {
	this.forme = f;
	
	this.save_position = {'monde': config.depart.monde, 'x': undefined, 'y': undefined}
	this.previous_position = {'x': undefined, 'y': undefined};
	
	this.taille = 10;
	this.pts_coll = { 
		'rond': { 
			'bas': {'x': 0, 'y': 10}, 'haut': {'x': 0, 'y': -10}, 'gauche': {'x': -10, 'y': 0}, 'droite': {'x': 10, 'y': 0}
		},
		'carre': { 
			'bas': [{'x': -10, 'y': 10}, {'x': 10, 'y': 10}], 'haut': [{'x': -10, 'y': -10}, {'x': 10, 'y': -10}], 
			'gauche': {'x': -10, 'y': 0}, 'droite': {'x': 10, 'y': 0}
		},
		'triangle': { 
			'bas': [{'x': -10, 'y': 10}, {'x': 10, 'y': 10}], 'haut': {'x': 0, 'y': -10}, 'gauche': {'x': -10, 'y': 0}, 'droite': {'x': 10, 'y': 0}
		}
	};
	
	this.inertie = 0;
	this.ralentissement = 0;
	this.fallAcceleration = 0;
	this.nuancier_saut = 0;
	this.hold_special = null;
	
	this.vitesse_saut = config.vitesse.saut;
	
	this.heros_shape = new createjs.Shape();
	this.heros_animation = new createjs.Container();
	
	this.collision = {};
}

Heros.prototype.start = function(x=undefined, y=undefined) {
	if (x && y) {
		this.shape = stage.addChild(new createjs.Container());
		this.shape.addChild(this.heros_shape);
		this.shape.addChild(this.heros_animation);
		
		this.shapeShift();
		
		this.shape.x = x;
		this.shape.y = y;
	
		if (this.save_position.x === undefined || this.save_position.y === undefined) this.save(x, y);
	} else {
		this.shape.x = this.save_position.x;
		this.shape.y = this.save_position.y;
		
		this.resetMomentum();
	}
}

Heros.prototype.resetMomentum = function() {
	this.fallAcceleration = 0;
	this.ralentissement = 0;
	this.inertie = 0;
}

Heros.prototype.save = function() {
	this.save_position.x = this.shape.x;
	this.save_position.y = this.shape.y;
}

Heros.prototype.isRespawning = function() {
	return moteur.frameCounters['death'].actif;
}

Heros.prototype.canShift = function() {
	if (!this.isShifting() && this.inertie == 0 && this.collision[direction.Bas]) {
		return true;
	}
}

Heros.prototype.isShifting = function() {
	return moteur.frameCounters['shift'].actif;
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
		this.setSwitchDir(direction.Droite);
	} else if (this.shape.x < b.gauche) { 
		this.setSwitchDir(direction.Gauche);
	} else if (this.shape.y > b.bas) {
		this.setSwitchDir(direction.Bas);
	} else if (this.shape.y < b.haut) { 
		this.setSwitchDir(direction.Haut);
	}
	return this.isSwitching();
}

Heros.prototype.isMoving = function() {
	if (this.previous_position.x != undefined && this.previous_position.y != undefined) {
		if (Math.abs(this.previous_position.x - this.shape.x) >= 1 || Math.abs(this.previous_position.y - this.shape.y) >= 1) {
			return true;
		} else {
			return false;
		}
		return false;
	}
}

Heros.prototype.canMove = function() {
	if (this.isUsingSpecial()) {
		return false;
	} else {
		return true;
	}
}

Heros.prototype.move = function(dir, t) {
	var new_pos = {x: this.shape.x, y: this.shape.y};
	switch(dir) {
		case direction.Haut:
			new_pos.y -= (moteur.timeSpent(t) * this.vitesse_saut) * (1-this.ralentissement);
			break;
		case direction.Bas:
			new_pos.y += (moteur.timeSpent(t) * config.vitesse.chute) * (Math.pow(this.fallAcceleration, 2));
			break;
		case direction.Gauche:
		case direction.Droite:
			new_pos.x += moteur.timeSpent(t) * config.vitesse.deplacement * (this.inertie / config.limites.inertie);
			break;
	}

	if (dir == direction.Bas) {
		var old_col = this.collision[dir];
		this.collision[dir] = moteur.checkCollision(new_pos, this.pts_coll[this.forme][dir], dir);
		if (old_col && this.isFalling()) {
			if (this.previous_position.x > this.shape.x) {
				this.inertie = this.inertie > -5 ? this.inertie -5 : -1 * config.limites.inertie;
			} else if (this.previous_position.x < this.shape.x) {
				this.inertie = this.inertie > -5 ? this.inertie +5 : config.limites.inertie;
			}
		}
	} else {
		this.collision[dir] = moteur.checkCollision(new_pos, this.pts_coll[this.forme][dir], dir);
	}
	this.previous_position.y = this.shape.y;
	this.previous_position.x = this.shape.x;
	
	if (!this.collision[dir]) {
		switch(dir) {
			case direction.Haut:
			case direction.Bas:
				this.shape.y = new_pos.y;
				break;
			case direction.Gauche:
			case direction.Droite:
				this.shape.x = new_pos.x;
				this.shapeAnimation('move');
				break;
		}
	} else {
		this.adjustPosition(dir);
	}
}

Heros.prototype.adjustPosition = function(dir) {
	var obj = this.collision[dir].obj ? this.collision[dir].obj : this.collision[dir];
	var obj_bounds = obj.getTransformedBounds();
	
	switch(dir) {
		case direction.Haut:
			this.getJump().reset();
			if (this.shape.y <= obj_bounds.y + obj_bounds.height + this.taille) this.shape.y = obj_bounds.y + obj_bounds.height + this.taille;
			break;
		case direction.Bas:
			if (obj.rotation != 0) console.log(obj_bounds);
			if (this.shape.y != obj_bounds.y - this.taille) this.shape.y = obj_bounds.y - this.taille;
			break;
		case direction.Gauche:
			if (this.shape.x != obj_bounds.x + obj_bounds.width + this.taille) this.shape.x = obj_bounds.x + obj_bounds.width + this.taille;
			this.shapeAnimation('move');
			break;
		case direction.Droite:
			if (this.shape.x != obj_bounds.x - this.taille) this.shape.x = obj_bounds.x - this.taille;
			this.shapeAnimation('move');
			break;
	}
}

Heros.prototype.activate = function() {
	var item_to_activate = moteur.checkCollisionByType(this.shape, {x:0, y:0}, direction.Bas, false, 'loot');
	if (item_to_activate) {
		if (item_to_activate.param.proprietes) {
			for (p_name in item_to_activate.param.proprietes) {
				switch(p_name) {
					case "sauve":
						this.save();
						moteur.save();
						break;
				}
			}
		}
	}
}

Heros.prototype.getJump = function() {
	return moteur.frameCounters['jump'];
}
Heros.prototype.isJumping = function() {
	return this.getJump().actif;
}

Heros.prototype.isFalling = function() {
	if (this.collision[direction.Bas] && !this.isJumping()) {
		return false;
	} else {
		return true;
	}
}

Heros.prototype.canSpecial = function() {
	if (!this.isShifting() && !this.isSwitching() && !this.isUsingSpecial()) {
		switch(this.forme) {
			case forme.Carre:
				if (!this.collision[direction.Bas] || this.isJumping()) {
					return true;
				} else {
					return false;
				}
				break;
			case forme.Rond:
				if (this.collision[direction.Bas] && !this.isJumping() && !this.isMoving()) {
					return true;
				} else {
					return false;
				}
				break;
			case forme.Triangle:
				if (this.collision[direction.Bas] && !this.isJumping() && !this.isMoving()) {
					return true;
				} else {
					return false;
				}
				break;
		}
	} else {
		return false;
	}
}

Heros.prototype.isUsingSpecial = function() {
	return moteur.frameCounters['special'].actif;
}

Heros.prototype.shapeShift = function() {
	if (this.shape.children.length > 0) {
		this.shape.children.forEach(function(c) {
			if (c.graphics) c.graphics.clear();
		});
	}
	
	switch(this.forme) {
		case forme.Carre:
			this.heros_shape.graphics.beginFill("red").drawRect(-10, -10, 20, 20);
			current_forme = forme.Carre;
			break;
		case forme.Rond:
			this.heros_shape.graphics.beginFill("blue").drawCircle(0, 0, 10)
			this.animation = new createjs.Shape();
			this.animation.graphics.beginFill("white").drawCircle(0, -4, 2);
			this.shape.addChild(this.animation);
			current_forme = forme.Rond;
			break;
		case forme.Triangle:
			this.heros_shape.graphics.beginFill("yellow").drawPolyStar(0, 0, 15, 3, 0, -90);
			current_forme = forme.Triangle;
			break;
	}
}

Heros.prototype.nextShape = function() {
	switch(this.forme) {
		case forme.Carre:
			this.forme = forme.Rond;
			break;
		case forme.Rond:
			this.forme = forme.Triangle;
			break;
		case forme.Triangle:
			this.forme = forme.Carre;
			break;
	}
}

Heros.prototype.shapeAnimation = function(action, step, frame_number=1, frame_total=1) {
	if (action == "shift") {
		switch(step) {
			case "start":
				var s1, s2, s3;
				s1 = new createjs.Shape();
				s2 = new createjs.Shape();
				switch(this.forme) {
					case forme.Carre:
						s1.graphics.beginFill("yellow").drawPolyStar(-7, -12, 6, 3, 0, -90);
						s2.graphics.beginFill("blue").drawCircle(7, -12, 3);
						break;
					case forme.Rond:
						s1.graphics.beginFill("red").drawRect(-7, -12, 6, 6);
						s2.graphics.beginFill("yellow").drawPolyStar(7, -12, 6, 3, 0, -90);
						break;
					case forme.Triangle:
						s1.graphics.beginFill("blue").drawCircle(-7, -12, 3);
						s2.graphics.beginFill("red").drawRect(7, -12, 6, 6);
						break;
				}
				this.heros_animation.addChild(s1);
				this.heros_animation.addChild(s2);
				break;
			case "step1":
				var s1 = this.heros_animation.getChildAt(0);
				var s2 = this.heros_animation.getChildAt(1);
				s1.x -= 3/frame_number; s1.y -= 3/frame_number; s1.rotate -= 5;
				s2.x += 3/frame_number; s2.y -= 3/frame_number; s2.rotate += 5;
				
				this.heros_shape.scaleX *= 0.9;
				this.heros_shape.scaleY *= 0.9;
				break;
			case "next":
				//
				break;
			case "step2":
				var s1 = this.heros_animation.getChildAt(0);
				var s2 = this.heros_animation.getChildAt(1);
				s1.rotate -= 5;
				s2.rotate += 5;
			
				this.heros_shape.scaleX *= 1.1;
				this.heros_shape.scaleY *= 1.1;
				break;
			case "end":
				this.heros_shape.scaleX = 1;
				this.heros_shape.scaleY = 1;
				this.heros_animation.removeAllChildren();
				break;
		}
	} else if (action == "special") {
		switch(this.forme) {
			case forme.Carre:
				if (step == "prepare") {
					this.heros_shape.rotation += 12;
				} else if (step == "go") {
					
				}
				break;
			case forme.Rond:
				if (step == "prepare") {
					this.shape.skewX = this.inertie/2;
				} else if (step == "go") {
					
				} else if (step == "stop") {
					this.shape.skewX = 0;
				}
				break;
			case forme.Triangle:
				if (step == "prepare") {
					this.heros_shape.scaleY = config.vitesse.saut / this.vitesse_saut;
				} else if (step == "ready") {
					/*
					s1 = new createjs.Shape();
					s1.graphics.beginFill("black").drawCircle(0, -5, 3);
					this.heros_animation.addChild(s1);
					*/
				} else if (step == "go") {
					this.heros_shape.scaleY = 1;
				}
				break;
		}
	} else if (action == "move") {
		switch(this.forme) {
			case forme.Carre:
				this.heros_shape.rotation += Math.sign(this.inertie) * 5;
				break;
			case forme.Rond:
				this.animation.rotation += this.inertie;
				this.shape.skewX = this.inertie;
				break;
			case forme.Triangle:
				this.heros_shape.rotation += Math.sign(this.inertie) * 5;
				break;
		}
	} else if (action == "wait") {
		switch(this.forme) {
			case forme.Carre:
				var reste = Math.floor(this.heros_shape.rotation / 90);
				this.heros_shape.rotation = reste * 90;
				break;
			case forme.Rond:
				
				break;
			case forme.Triangle:
				// var reste = Math.floor(this.heros_shape.rotation / 120);
				// this.heros_shape.rotation = reste * 120;
				this.heros_shape.rotation = 0;
				break;
		}
	} else if (action == "die") {
		switch(step) {
			case "start":
				var s1, s2, s3;
				s1 = new createjs.Shape();
				s2 = new createjs.Shape();
				s3 = new createjs.Shape();

				s1.graphics.beginFill("yellow").drawPolyStar(-7, -12, 6, 3, 0, -90);
				s2.graphics.beginFill("red").drawRect(0, -14, 6, 6);
				s3.graphics.beginFill("blue").drawCircle(7, -12, 3);
						
				this.heros_animation.addChild(s1);
				this.heros_animation.addChild(s2);
				this.heros_animation.addChild(s3);
				break;
			case "step1":
				var s1 = this.heros_animation.getChildAt(0);
				var s2 = this.heros_animation.getChildAt(1);
				var s3 = this.heros_animation.getChildAt(2);
				s1.x -= 3/frame_number; s1.y -= 3/frame_number; s1.rotate -= 5;
				s2.y -= 4/frame_number; s2.rotate += 5;
				s3.x += 3/frame_number; s3.y -= 3/frame_number; s3.rotate += 5;
			
				this.heros_shape.scaleX *= 0.8;
				this.heros_shape.scaleY *= 0.8;
				break;
			case "end":
				this.heros_shape.scaleX = 1;
				this.heros_shape.scaleY = 1;
				this.heros_animation.removeAllChildren();
				break;
		}
	}
}