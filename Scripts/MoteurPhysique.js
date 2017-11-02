function MoteurPhysique(stage, heros) {
	this.stage = stage;
	this.heros = heros;
	
	this.frameCounters = {};
	this.initFC();
	
	this.save_position = { 'monde': config.depart.monde, 'ecran': undefined, 'x': undefined, 'y': undefined };
}

MoteurPhysique.prototype.start = function(x=undefined, y=undefined) {
	if (x !== undefined && y !== undefined) {
		this.stage.x -= x;
		this.stage.y -= y;
		
		this.save();
	} else {
		this.stage.x = -1 * this.save_position.x * config.taille.w * config.pixel.w;
		this.stage.y = -1 * this.save_position.y * config.taille.h * config.pixel.h;
	}
}

MoteurPhysique.prototype.save = function() {
	this.save_position.ecran = ecran;
	this.save_position.x = ecran.position.x;
	this.save_position.y = ecran.position.y;
}

MoteurPhysique.prototype.initFC = function() {
	this.frameCounters['switch'] = new FrameCounter(config.recovery['switch']);
	this.frameCounters['death'] = new FrameCounter(config.recovery['death']);
	this.frameCounters['wait_jump'] = new FrameCounter(config.recovery['wait_jump']);
	this.frameCounters['shift'] = new FrameCounter(config.recovery['shift'], function() {
		heros.nextShape();
		heros.shapeAnimation("shift", "start");
	});
	this.frameCounters['jump'] = new FrameCounter(config.limites.nuancier[0].recovery);
	// Pas de recovery (pour le moment)
	this.frameCounters['special'] = new FrameCounter(config.recovery['special'], function() {
		moteur.frameCounters['jump'].reset();
	});
}

MoteurPhysique.prototype.activate = function(action) {
	var fc = this.frameCounters[action];
	fc.activate();
}

MoteurPhysique.prototype.animateDeath = function() {
	var fc = this.frameCounters['death'];
	fc.increment();
	
	if (fc.isFirstFrame()) this.heros.shapeAnimation('die', 'start', fc.counter, fc.nb_frames);
	else this.heros.shapeAnimation('die', 'step1', fc.counter, fc.nb_frames);
	
	if (fc.isLastFrame()) {
		moteur.start();
		heros.start();
		
		ecran = this.save_position.ecran;
		
		this.heros.shapeAnimation('die', 'end');
		
		fc.reset();
	}
}

MoteurPhysique.prototype.animateSwitch = function() {
	var dir = this.heros.getSwitchDir();
	var fc = this.frameCounters['switch'];
	fc.increment();
	
	switch(dir) {
		case direction.Gauche:
			this.stage.x += config.taille.w * config.pixel.w / fc.nb_frames;
			break;
		case direction.Droite:
			this.stage.x -= config.taille.w * config.pixel.w / fc.nb_frames;
			break;
		case direction.Haut:
			this.stage.y += config.taille.h * config.pixel.h / fc.nb_frames;
			break;
		case direction.Bas:
			this.stage.y -= config.taille.h * config.pixel.h / fc.nb_frames;
			break;
	}
	
	if (fc.isLastFrame()) {
		fc.reset();
		this.heros.setSwitchDir(undefined);
	}
}

MoteurPhysique.prototype.animateJump = function() {
	var fc = this.frameCounters['jump'];
	fc.increment();
	
	var h = this.heros;

	config.limites.nuancier.some(function(ns) {
		if (h.nuancier_saut <= ns.nb_frames) {
			h.ralentissement = ns.ralentissement * fc.counter / ns.recovery;
			fc.nb_frames = ns.recovery;
			return true;
		}
	});
	
	if (fc.isLastFrame()) {
		fc.reset();
	}
}

MoteurPhysique.prototype.waitJump = function() {
	var fc = this.frameCounters['wait_jump'];
	if (fc.actif) {
		fc.increment();
	
		if (fc.isLastFrame()) {
			fc.reset();
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}

MoteurPhysique.prototype.initTriggers = function() {
	var m = this;
	
	items_game[ecran.nom]['plateforme'].forEach(function(item) {
		if (item.param.proprietes) {
			for (p_name in item.param.proprietes) {
				if (item.param.proprietes[p_name].trigger) {
					if (item.param.proprietes[p_name].trigger.length > 0) {
						var trigger_array = [];
						for (var i=0 ; i < item.param.proprietes[p_name].trigger.length ; i++) {
							trigger_array.push({'name': item.param.proprietes[p_name].trigger[i], 'value': false});
						}
						item.param.proprietes[p_name].trigger = trigger_array;
					}
				}
			}
		}
	});
	
	items_game[ecran.nom]['loot'].forEach(function(item) {
		if (item.param.proprietes) {
			for (p_name in item.param.proprietes) {
				if (item.param.proprietes[p_name].trigger) {
					if (item.param.proprietes[p_name].trigger.length > 0) {
						var trigger_array = [];
						for (var i=0 ; i < item.param.proprietes[p_name].trigger.length ; i++) {
							trigger_array.push({'name': item.param.proprietes[p_name].trigger[i], 'value': false});
						}
						item.param.proprietes[p_name].trigger = trigger_array;
					}
				}
			}
		}
	});
}

MoteurPhysique.prototype.checkTriggers = function(item, trigger) {
	if (item.param.proprietes) {
		for (p_name in item.param.proprietes) {
			if (item.param.proprietes[p_name].trigger) {
				if (item.param.proprietes[p_name].trigger.length > 0) {
					item.param.proprietes[p_name].trigger.some(function(trig) {
						if (trig.name == trigger) {
							trig.value = true;
							return true;
						}
					});
				}
			}
		}
	}
}

MoteurPhysique.prototype.initItemsLinks = function() {
	var m = this;
	
	items_game[ecran.nom]['loot'].forEach(function(item) {
		var obj_to_test, pt_coll;
		obj_to_test = item.obj;
		pt_coll = {'x': obj_to_test.x + obj_to_test.graphics.command.w/2, 'y': obj_to_test.y + obj_to_test.graphics.command.h};

		var item_coll = m.checkCollision(obj_to_test, pt_coll, direction.Bas, false);
		if (item_coll && item_coll.param.proprietes) {
			for (p_name in item_coll.param.proprietes) {
				if (p_name == "mouvement") {
					if (!item_coll.links) item_coll.links = []
					item_coll.links.push(item);
				}
			}
		}
	});
}

MoteurPhysique.prototype.execItemsProperties = function() {
	var m = this;
	
	items_game[ecran.nom]['plateforme'].forEach(function(item) {
		if (item.param.proprietes) {
			for (p_name in item.param.proprietes) {
				if (item.param.proprietes[p_name].trigger && item.param.proprietes[p_name].trigger.length >= 0 && item.param.proprietes[p_name].trigger.some(function (t) { return !t.value; })) {
					//if (p_name == "rotation") console.log(item.param.proprietes[p_name].trigger);
				} else {
					switch(p_name) {
						case 'mouvement':
							m.execPFMouvement(item, item.param.proprietes[p_name]);
							break;
						case 'rotation':
							m.execPFRotation(item, item.param.proprietes[p_name]);
							break;
					}
				}
			}
		}
	});
	
	monde.ecrans.forEach(function(e) {
		items_game[e.nom]['decor'].forEach(function(item) {
			if (item.param.proprietes) {
				for (p_name in item.param.proprietes) {
					if (item.param.proprietes[p_name].trigger && item.param.proprietes[p_name].trigger.length >= 0 && item.param.proprietes[p_name].trigger.some(function (t) { return !t.value; })) {
						//if (p_name == "rotation") console.log(item.param.proprietes[p_name].trigger);
					} else {
						switch(p_name) {
							case 'defilement':
								m.execImgDefilement(item, item.param.proprietes[p_name]);
								break;
						}
					}
				}
			}
		});
	});
}

MoteurPhysique.prototype.execPFMouvement = function(item, param_prop) {
	var coeff_directeur = undefined;
	var delta_x = param_prop.representation.x2 - param_prop.representation.x1;
	var delta_y = param_prop.representation.y2 - param_prop.representation.y1;
	
	if (!param_prop.vitesse) {
		param_prop.vitesse = 3;
	}
	if (!param_prop.sens) {
		param_prop.sens = 1;
	}

	if (delta_y != 0) {
		coeff_directeur = delta_x / delta_y;
	} else {
		coeff_directeur = undefined;
	}
	
	if (coeff_directeur == undefined) {
		item.obj.x += param_prop.vitesse * param_prop.sens;
		
		if (item.obj === this.heros.collision[direction.Bas]) this.heros.shape.x += param_prop.vitesse * param_prop.sens;
		if (item.links) {
			item.links.forEach(function(i) {
				i.x += param_prop.vitesse * param_prop.sens;
			});
		}
	} else if (coeff_directeur == 0) {
		item.obj.y += param_prop.vitesse * param_prop.sens;
		
		if (item.obj === this.heros.collision[direction.Bas]) this.heros.shape.y += param_prop.vitesse * param_prop.sens;
		if (item.links) {
			item.links.forEach(function(i) {
				i.y += param_prop.vitesse * param_prop.sens;
			});
		}
	} else if (coeff_directeur < 1 && coeff_directeur > -1) {
		item.obj.x += param_prop.vitesse * param_prop.sens;
		item.obj.y += param_prop.vitesse * param_prop.sens * coeff_directeur;
		
		if (item.obj === this.heros.collision[direction.Bas]) {
			this.heros.shape.x += param_prop.vitesse * param_prop.sens;
			this.heros.shape.y += param_prop.vitesse * param_prop.sens * coeff_directeur;
		}
		if (item.links) {
			item.links.forEach(function(i) {
				i.x += param_prop.vitesse * param_prop.sens;
				i.y += param_prop.vitesse * param_prop.sens * coeff_directeur
			});
		}
	} else {
		item.obj.x += param_prop.vitesse * param_prop.sens;
		item.obj.y += param_prop.vitesse * param_prop.sens / coeff_directeur;
		
		if (item.obj === this.heros.collision[direction.Bas]) {
			this.heros.shape.x += param_prop.vitesse * param_prop.sens;
			this.heros.shape.y += param_prop.vitesse * param_prop.sens / coeff_directeur;
		}
		if (item.links) {
			item.links.forEach(function(i) {
				i.x += param_prop.vitesse * param_prop.sens;
				i.y += param_prop.vitesse * param_prop.sens / coeff_directeur;
			});
		}
	}
	
	var bornes_x = {inf: 0, sup: 0};
	var bornes_y = {inf: 0, sup: 0};
	if (delta_x > 0) { bornes_x.inf = param_prop.representation.x1 + ecran.position.x * config.taille.w; bornes_x.sup = param_prop.representation.x2 + ecran.position.x * config.taille.w; }
	else if (delta_x < 0) { bornes_x.inf = param_prop.representation.x2 + ecran.position.x * config.taille.w; bornes_x.sup = param_prop.representation.x1 + ecran.position.x * config.taille.w; }
	if (delta_y > 0) { bornes_y.inf = param_prop.representation.y1 + ecran.position.y * config.taille.h; bornes_y.sup = param_prop.representation.y2 + ecran.position.y * config.taille.h; }
	else if (delta_y < 0) { bornes_y.inf = param_prop.representation.y2 + ecran.position.y * config.taille.h; bornes_y.sup = param_prop.representation.y1 + ecran.position.y * config.taille.h; }
	
	var bounds = item.obj.getBounds().clone();
	var t_bounds = item.obj.getTransformedBounds();
	if (delta_x != 0 && (t_bounds.x <= bornes_x.inf * config.pixel.w || t_bounds.x >= bornes_x.sup * config.pixel.w)
		|| delta_y != 0 && (t_bounds.y <= bornes_y.inf * config.pixel.h || t_bounds.y >= bornes_y.sup * config.pixel.h)) {
		
		param_prop.sens *= -1;
	}
	
	if (delta_x != 0 && t_bounds.x < bornes_x.inf * config.pixel.w) item.obj.x = bornes_x.inf * config.pixel.w - bounds.x;
	if (delta_x != 0 && t_bounds.x > bornes_x.sup * config.pixel.w) item.obj.x = bornes_x.sup * config.pixel.w - bounds.x;
	if (delta_y != 0 && t_bounds.y < bornes_y.inf * config.pixel.h) item.obj.y = bornes_y.inf * config.pixel.h - bounds.y;
	if (delta_y != 0 && t_bounds.y > bornes_y.sup * config.pixel.h) item.obj.y = bornes_y.sup * config.pixel.h - bounds.y;
}

MoteurPhysique.prototype.execPFRotation = function(item, param_prop) {
	if (param_prop.representation.r && item.obj.rotation < param_prop.representation.r) {
		item.obj.rotation += 1;
	}
}

MoteurPhysique.prototype.execImgDefilement = function(item, param_prop) {
	item.obj.x += param_prop.vitesse * param_prop.representation.sens;
}

MoteurPhysique.prototype.checkCollision = function(obj_obs, pts, dir, onlyObj=true) {
	var res;
	res = this.checkCollisionByType(obj_obs, pts, dir, onlyObj, 'ennemi');
	if (res) this.activate('death');
	
	res = this.checkCollisionByType(obj_obs, pts, dir, onlyObj, 'plateforme');
	return res;
}

MoteurPhysique.prototype.checkCollisionByType = function (obj_obs, pts, dir, onlyObj, type) {
	var m = this;
	var res;
	
	items_game[ecran.nom][type].forEach(function(item) {
		var obj = item.obj;
		if (obj) {
			var obj_bounds = obj.getTransformedBounds();

			if (m.checkCollisionProp(item, dir)) {
				if (pts.constructor === Array) {
					var verif = pts.some(function(pt) {
						if (obj_obs.x + pt.x >= obj_bounds.x && obj_obs.x + pt.x <= obj_bounds.x + obj_bounds.width && 
							obj_obs.y + pt.y >= obj_bounds.y && obj_obs.y + pt.y <= obj_bounds.y + obj_bounds.height) {
							return true;
						}
					});
					
					if (verif) {
						var compteur = 0;
						for (var x = pts[0].x ; x <= pts[1].x ; x++) {
							for (var y = pts[0].y ; y <= pts[1].y ; y++) {
								if (obj_obs.x + x >= obj_bounds.x && obj_obs.x + x <= obj_bounds.x + obj_bounds.width && 
									obj_obs.y + y >= obj_bounds.y && obj_obs.y + y <= obj_bounds.y + obj_bounds.height) {
									
									compteur++;
								}
							}
						}
						
						if (compteur >= 10) {
							if (onlyObj) res = obj;
							else res = item;
							m.checkTriggers(item, 'collision');
						}
					}
				} else {
					if (obj_obs.x + pts.x >= obj_bounds.x && obj_obs.x + pts.x <= obj_bounds.x + obj_bounds.width && 
						obj_obs.y + pts.y >= obj_bounds.y && obj_obs.y + pts.y <= obj_bounds.y + obj_bounds.height) {
							
						if (onlyObj) res = obj;
						else res = item;
						m.checkTriggers(item, 'collision');
					}
				}
			}
		}
	});
	
	return res;
}

MoteurPhysique.prototype.checkCollisionProp = function(item, dir) {
	if (item.param.proprietes) {
		for (prop in item.param.proprietes) {
			if (prop == "traversable" && (dir != "bas" || dir == "bas" && this.heros.previous_position.y > item.obj.y - this.heros.taille)) {
				return false;
			}
		}
	}
	return true;
}

MoteurPhysique.prototype.timeSpent = function(t) {
	return (t / 1000 * 60);
}

MoteurPhysique.prototype.animateShift = function() {
	var fc = this.frameCounters['shift'];
	fc.increment();
	
	if (fc.counter == fc.nb_frames /2) {
		this.heros.shapeAnimation("shift", "next");
		this.heros.shapeShift();
	} else if (fc.counter < fc.nb_frames /2) {
		this.heros.shapeAnimation("shift", "step1", fc.counter+1, fc.nb_frames /2);
	} else if (fc.counter == fc.nb_frames) {
		this.heros.shapeAnimation("shift", "step2", fc.counter - fc.nb_frames /2, fc.nb_frames /2);
		this.heros.shapeAnimation("shift", "end");
	} else if (fc.counter > fc.nb_frames /2) {
		this.heros.shapeAnimation("shift", "step2", fc.counter - fc.nb_frames /2, fc.nb_frames /2);
	}
	
	if (fc.isLastFrame()) {
		playMusic(selected_format);
		
		fc.reset();
	}
}

MoteurPhysique.prototype.animateSpecial = function(t) {
	var fc = this.frameCounters['special'];
	fc.increment();
	
	if (this.heros.forme == "carre") {
		if (fc.counter <= 15) {
			this.heros.shapeAnimation("special", "prepare");
		} else {
			this.heros.fallAcceleration = 3;
			this.heros.move(direction.Bas, t);
			this.heros.shapeAnimation("special", "go");
			var item_coll = this.checkCollision(this.heros.shape, this.heros.pts_coll[this.heros.forme][direction.Bas], direction.Bas, false);
			
			if (item_coll) {
				this.heros.collision[direction.Bas] = item_coll.obj;
				this.heros.fallAcceleration = 0;
				
				if (item_coll.param.proprietes && item_coll.param.proprietes.destructible) {
					try {
						deleteItem("plateforme", item_coll);
					} catch(e) {
						console.log(e);
					}
				}
				fc.reset();
				this.heros.adjustPosition(direction.Bas);
			}
		}
	} else if (this.heros.forme == "rond") {
		if (this.heros.hold_special != null) {
			if (this.heros.hold_special == 0) {
				//this.heros.inertie = 0;
			} else if (this.heros.hold_special == 1 && this.heros.inertie < 40) {
				this.heros.inertie += 2;
				this.heros.shapeAnimation("special", "prepare");
			} else if (this.heros.hold_special == -1 && this.heros.inertie > -40) {
				this.heros.inertie -= 2;
				this.heros.shapeAnimation("special", "prepare");
			}
		} else {
			if (heros.inertie < 0) {
				heros.move(direction.Gauche, t);
				this.heros.collision[direction.Droite] = undefined;
			} else if (heros.inertie > 0) {
				heros.move(direction.Droite, t);
				this.heros.collision[direction.Gauche] = undefined;
			}
			
			if (this.heros.inertie > 0) this.heros.inertie--;
			else this.heros.inertie++;
			
			this.heros.shapeAnimation("special", "go");
			
			if (this.heros.inertie < 1 && this.heros.inertie > -1) this.heros.inertie = 0;
			
			if (this.heros.inertie == 0 || this.heros.collision[direction.Gauche] || this.heros.collision[direction.Droite]) {
				this.heros.inertie = 0
				this.heros.shapeAnimation("special", "stop");
				fc.reset();
			}
		}
	} else if (this.heros.forme == "triangle") {
		if (this.heros.hold_special != null) {
			if (this.heros.vitesse_saut < 16) {
				this.heros.shapeAnimation("special", "prepare");
				this.heros.vitesse_saut += 0.25;
			} else {
				this.heros.shapeAnimation("special", "ready");
			}
		} else {
			this.heros.move(direction.Haut, t);
			
			this.heros.shapeAnimation("special", "go");
			
			if (this.heros.vitesse_saut > config.vitesse.saut) this.heros.vitesse_saut -= 1/(this.heros.vitesse_saut - config.vitesse.saut);
			
			if (this.heros.vitesse_saut <= config.vitesse.saut) {
				this.heros.vitesse_saut = config.vitesse.saut;
				fc.reset();
			}
		}
	}
}