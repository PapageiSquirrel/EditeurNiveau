function createEcran() {
	if (ecran.constructor === Ecran) ecran.save(items_edit);
	
	var name = document.getElementById("newEcranName").value;
	
	if (name) {
		if (index_ecran_sauve != -1) {
			showWorld();
		}
		
		clearCanvas();
		
		var new_ecran = new Ecran(monde.ecrans.length, name);
		//var new_ecran = name, 'position': {'x': undefined, 'y': undefined}, 'plateformes': [], 'decors': [], 'loots': []};
		monde.ecrans.push(new_ecran);
		ecran = new_ecran;
		
		loadEcranOnCanvas();
		
		var select = document.getElementById("existingEcrans");
		var option = document.createElement("option");
		option.text = name;
		select.add(option);
	}
}

function loadExistingEcrans() {
	var select = document.getElementById("existingEcrans");
	
	for(var i = 0 ; i < monde.ecrans.length ; i++) {
		var option = document.createElement("option");
		option.text = monde.ecrans[i].nom;
		select.add(option);
	}
}

function loadEcran() {
	if (ecran.constructor === Ecran) ecran.save(items_edit);
	
	var select = document.getElementById("existingEcrans");
	
	if (select.selectedIndex != 0 && select.selectedIndex != -1) {
		if (index_ecran_sauve != -1) {
			showWorld();
		}
		
		createEcranOnCanvas(select.selectedIndex-1);
	}
}

function createEcranOnCanvas(index) {
	clearCanvas();
	
	var obj_e = monde.ecrans[index];
	ecran = new Ecran(index, obj_e.nom, obj_e.position.x, obj_e.position.y, obj_e.plateformes, obj_e.decors, obj_e.loots, obj_e.ennemis);
	
	if (mode == 'edit') loadEcranOnCanvas();
}

function loadEcranOnCanvas() {
	document.getElementById("path").innerHTML = monde.nom + " > " + ecran.nom;

	document.getElementById("positionX").value = ecran.position.x;
	document.getElementById("positionY").value = ecran.position.y;
	
	stage.addChild(grid);
	
	config.item.type.forEach(function(type) {
		ecran[type+"s"].forEach(function(item) {
			items_edit[type].push(createItem(ecran.layers[type+"s"], type, item));
		});
	});
	
	loadAdjacentEcranCanvas();

	stage.update();
}

function changeEcranPosition() {
	ecran.changePosition(new Number(document.getElementById("positionX").value), new Number(document.getElementById("positionY").value));
	
	loadAdjacentEcranCanvas();
}

function loadAdjacentEcranCanvas() {
	if (ecran.constructor === Ecran && ecran.hasPosition()) {
		ecrans_necessaires.haut = false;
		ecrans_necessaires.bas = false;
		ecrans_necessaires.gauche = false;
		ecrans_necessaires.droite = false;

		for(var i = 0; i < monde.ecrans.length ; i++) {
			var obj_e = monde.ecrans[i];
			var e = new Ecran(i, obj_e.nom, obj_e.position.x, obj_e.position.y, obj_e.plateformes, obj_e.decors, obj_e.loots);
			
			var dir = ecran.isAdjacentTo(e);
			if (dir) createCanvasOfAdjacentEcran(i, e, dir);
			/*
			if (e.position.x !== undefined && e.position.y !== undefined) {
				// Vérifie si l'écran est adjacent à un autre
				if (e.position.x == ecran.position.x && e.position.y == ecran.position.y-1) {
					createCanvasOfAdjacentEcran(i, e, 'haut');
				} else if (e.position.x == ecran.position.x && e.position.y == ecran.position.y+1) {
					createCanvasOfAdjacentEcran(i, e, 'bas');
				} else if (e.position.y == ecran.position.y && e.position.x == ecran.position.x-1) {
					createCanvasOfAdjacentEcran(i, e, 'gauche');
				} else if (e.position.y == ecran.position.y && e.position.x == ecran.position.x+1) {
					createCanvasOfAdjacentEcran(i, e, 'droite');
				}
			}
			*/
		}
		
		for(var prop in ecrans_necessaires) {
			if (!ecrans_necessaires[prop]) {
				var el = document.getElementById("previewEcran" + prop);
				if (el.childNodes.length > 1) {
					el.removeChild(document.getElementById(prop));
					stage_adjacents[prop] = undefined;
				}
			}
		}
	} else {
		clearAdjacentCanvas();
	}
}

function clearAdjacentCanvas() {
	ecrans_necessaires.haut = false;
	ecrans_necessaires.bas = false;
	ecrans_necessaires.gauche = false;
	ecrans_necessaires.droite = false;
	
	for(var prop in ecrans_necessaires) {
		if (!ecrans_necessaires[prop]) {
			var el = document.getElementById("previewEcran" + prop);
			if (el.childNodes.length > 1) {
				el.removeChild(document.getElementById(prop));
				stage_adjacents[prop] = undefined;
			}
		}
	}
}

function createCanvasOfAdjacentEcran(index, e, dir) {
	ecrans_necessaires[dir] = true;
	ecrans_adjacents[dir] = index;
	
	var canvas_adj = document.getElementById(dir);
	if (!canvas_adj) {
		var canvas_adj = document.createElement("CANVAS");
		canvas_adj.id = dir;
	}

	switch(dir) {
		case 'haut':
			canvas_adj.height = config.pixel.h * config.taille.h /4; 
			canvas_adj.width = config.pixel.w * config.taille.w;
			document.getElementById("previewEcranhaut").appendChild(canvas_adj);
			break;
		case 'bas':
			canvas_adj.height = config.pixel.h * config.taille.h /4; 
			canvas_adj.width = config.pixel.w * config.taille.w;
			document.getElementById("previewEcranbas").appendChild(canvas_adj);
			break;
		case 'gauche':
			canvas_adj.height = config.pixel.h * config.taille.h; 
			canvas_adj.width = config.pixel.w * config.taille.w /4;
			document.getElementById("previewEcrangauche").appendChild(canvas_adj);
			break;
		case 'droite':
			canvas_adj.height = config.pixel.h * config.taille.h; 
			canvas_adj.width = config.pixel.w * config.taille.w /4;
			document.getElementById("previewEcrandroite").appendChild(canvas_adj);
			break;
	}
	
	if (!stage_adjacents[dir]) {
		stage_adjacents[dir] = new createjs.Stage(dir);
	}
	
	config.item.type.forEach(function(type) {
		e[type+"s"].forEach(function(item) {
			var new_param;
			switch(dir) {
				case 'haut':
				case 'bas':
					new_param = {'x': item.x, 'y': item.y/4, 'w': item.w, 'h': item.h/4, 'couleur': item.couleur}
					if (item.sprite) new_param.sprite = item.sprite;
					if (item.proprietes) new_param.proprietes = item.proprietes;
					break;
				case 'gauche':
				case 'droite':
					new_param = {'x': item.x/4, 'y': item.y, 'w': item.w/4, 'h': item.h, 'couleur': item.couleur}
					if (item.sprite) new_param.sprite = item.sprite;
					if (item.proprietes) new_param.proprietes = item.proprietes;
					break;
			}
			
			createItem(stage_adjacents[dir], type, new_param, false);
		});
	});

	stage_adjacents[dir].update();
	
	canvas_adj.addEventListener("click", handleNavigation);
}

function handleNavigation(event) {
	ecran.save(items_edit);
	
	createEcranOnCanvas(ecrans_adjacents[event.target.id]);
}