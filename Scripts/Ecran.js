function Ecran(nom, pos_x=undefined, pos_y=undefined, pfs=[], decors=[], loots=[]) {
	this.nom = nom;
	this.position = {'x': pos_x, 'y': pos_y};
	this.plateformes = pfs;
	this.decors = decors;
	this.loots = loots;
}

Ecran.prototype.addItem = function(type, item) {
	this[type+"s"].push(item);
}

Ecran.prototype.save = function(items) {
	config.item.type.forEach(function(type) {
		this[type+"s"] = new Array();
		
		items[type].forEach(function(item) {
			this[type+"s"].push(item.param);
		});
	});
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