function MoteurPhysique(stage, heros) {
	this.stage = stage;
	this.heros = heros;
	
	this.switch_frame = 0;
	this.shift_frame = 0;
	this.jump_frame = 0;
	this.wait_jump_frame = 0;
}

MoteurPhysique.prototype.initSwitch = function() {
	this.switch_frame = 0;
}

MoteurPhysique.prototype.animateSwitch = function() {
	var dir = this.heros.getSwitchDir();
	this.switch_frame++;
	
	switch(dir) {
		case 'gauche':
			this.stage.x += config.taille.w * config.pixel.w / config.recovery['switch'];
			break;
		case 'droite':
			this.stage.x -= config.taille.w * config.pixel.w / config.recovery['switch'];
			break;
		case 'haut':
			this.stage.y += config.taille.h * config.pixel.h / config.recovery['switch'];
			break;
		case 'bas':
			this.stage.y -= config.taille.h * config.pixel.h / config.recovery['switch'];
			break;
	}
	
	if (this.switch_frame >= config.recovery['switch']) {
		this.switch_frame = 0;
		this.heros.setSwitchDir(undefined);
	}
}

MoteurPhysique.prototype.initJump = function() {
	this.jump_frame = 0;
}

MoteurPhysique.prototype.animateJump = function() {
	this.jump_frame++;
	
	if (this.jump_frame >= config.recovery['jump']) {
		this.heros.jump = false;
		this.jump_frame = 0;
	}
}

MoteurPhysique.prototype.initWaitJump = function() {
	this.wait_jump_frame = 0;
}

MoteurPhysique.prototype.waitJump = function() {
	this.wait_jump_frame++;
	
	if (this.wait_jump_frame >= config.recovery['wait_jump']) {
		this.wait_jump_frame = 0;
		return false;
	} else {
		return true;
	}
}

MoteurPhysique.prototype.checkCollision = function(pt) {
	var res;
	
	items_game[ecran.nom]['plateforme'].forEach(function(item) {
		var obj = item.obj;
		if (obj) {
			var pt_trans = this.heros.shape.localToLocal(pt.x, pt.y, obj);
			if (obj.hitTest(pt_trans.x, pt_trans.y)) {
				res = obj;
			}
		}
	});
	
	return res;
}

MoteurPhysique.prototype.timeSpent = function(t) {
	return (t / 1000 * 60);
}

MoteurPhysique.prototype.initShift = function() {
	this.heros.shifting = true;
	this.shift_frame = 0;
	
	this.heros.nextShape();
}

MoteurPhysique.prototype.animateShift = function() {
	this.shift_frame++;
	
	if (this.shift_frame >= config.recovery['shift']) {
		this.heros.shifting = false;
		this.shift_frame = 0;
	}
}