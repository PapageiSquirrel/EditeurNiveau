function Ecran(index, nom, pos_x=undefined, pos_y=undefined, pfs=[], decors=[], loots=[], ennemis=[]) {
	this.nom = nom;
	this.position = {'x': pos_x, 'y': pos_y};
	this.plateformes = pfs;
	this.decors = decors;
	this.loots = loots;
	this.ennemis = ennemis;
	this.index = index;
}

Ecran.prototype.addItem = function(type, item) {
	this[type+"s"].push(item);
}

Ecran.prototype.save = function(items) {
	var ecran_sauve = this;
	
	config.item.type.forEach(function(type) {
		ecran_sauve[type+"s"] = new Array();
		
		items[type].forEach(function(item) {
			var item_param_clone = {};
			
			for (p in item.param) {
				if (item.param.proprietes && p == "proprietes") {
					item_param_clone[p] = {};
					for (prop in item.param[p]) {
						if (item.param[p][prop]) {
							item_param_clone[p][prop] = {};
							if (item.param[p][prop].representation) {
								item_param_clone[p][prop].representation = JSON.parse(JSON.stringify(item.param[p][prop].representation.param));
							}
							
							for (va in item.param[p][prop]) {
								if (va != "representation") {
									item_param_clone[p][prop][va] = JSON.parse(JSON.stringify(item.param[p][prop][va]));
								}
							}
						}
					}
				} else {
					item_param_clone[p] = item.param[p] != undefined ? JSON.parse(JSON.stringify(item.param[p])) : undefined;
				}
			}
			ecran_sauve[type+"s"].push(item_param_clone);
		});
	});
	
	monde.ecrans[ecran_sauve.index] = ecran_sauve;
}

Ecran.prototype.changePosition = function(x, y) {
	this.position.x = x;
	this.position.y = y;
}

Ecran.prototype.isAdjacentTo = function(e) {
	if (e.constructor === Ecran && e.hasPosition() && this.hasPosition()) {
		if (e.position.x == this.position.x && e.position.y == this.position.y-1) {
			return 'haut';
		} else if (e.position.x == this.position.x && e.position.y == this.position.y+1) {
			return 'bas';
		} else if (e.position.y == this.position.y && e.position.x == this.position.x-1) {
			return 'gauche';
		} else if (e.position.y == this.position.y && e.position.x == this.position.x+1) {
			return 'droite';
		}
	}
	return null;
}

Ecran.prototype.hasPosition = function() {
	return this.position.x !== undefined && this.position.y !== undefined
}

Ecran.prototype.getBounds = function() {
	return {
		'gauche': ecran.position.x * config.taille.w * config.pixel.w, 
		'haut': ecran.position.y * config.taille.h * config.pixel.h, 
		'droite': (ecran.position.x+1) * config.taille.w * config.pixel.w, 
		'bas': (ecran.position.y+1) * config.taille.h * config.pixel.h
	};
}

/*
Ecran.prototype.switchTo = function(e) {
	if (e.constructor === Ecran) {
		this = e;
	}
}
*/