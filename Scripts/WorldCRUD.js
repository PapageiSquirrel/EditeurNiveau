function createWorld() {
	var name = document.getElementById("newWorldName").value;
	
	if (name) {
		monde = {'nom': name, 'ecrans': []};
		
		createWorldOnCanvas();
	}
}

function saveWorld() {
	ecran.save(items_edit);
	
	sendData(monde.nom + '.json', monde);
}

function loadExistingWorlds() {
	getListFiles('JSON/', function(list) {
		var select = document.getElementById("existingWorlds");
	
		for(var i = 0 ; i < list.length ; i++) {
			var option = document.createElement("option");
			option.text = list[i].slice(0, list[i].indexOf("."));
			select.add(option);
		}
	});
}

function loadWorld(param_nom=undefined) {
	var nom;
	
	if (mode == 'edit') {
		var select = document.getElementById("existingWorlds");
	
		if (select.selectedIndex != 0 && select.selectedIndex != -1) {
			nom = select.options[select.selectedIndex].text;
		}
	} else {
		nom = param_nom;
	}
	
	if (nom) {
		preload.loadFile({id: "monde", src: "JSON/" + nom + ".json"});
		preload.on("complete", handlePreloadWorldComplete, this);
	}
}

function handlePreloadWorldComplete() {
	monde = preload.getResult("monde");
	
	createWorldOnCanvas();
	
	initStage();
}

function createWorldOnCanvas() {
	if (mode == 'edit') document.getElementById("path").innerHTML = monde.nom + " > Aucun ecran";
	
	if (monde.ecrans.length != 0) {
		// TODO: charger l'écran dont la position est sauvegardé, sinon default (0)
		createEcranOnCanvas(0);
		
		if (mode == 'edit') {
			loadExistingEcrans();
		} else if (mode == 'game') {
			items_game = loadWorldOnCanvas();
		}
	} else {
		clearCanvas();
	}
	
	stage.update();
}

function showWorld() {
	if (index_ecran_sauve != -1) {
		document.getElementById("btnShowWorld").innerHTML = "Afficher";
		
		clearCanvas();
		createEcranOnCanvas(index_ecran_sauve);
		index_ecran_sauve = -1;
		
		stage.scaleX = 1;
		stage.scaleY = 1;
		
		stage.update();
	} else if (monde) {
		document.getElementById("btnShowWorld").innerHTML = "Retour";
		
		ecran.save();
		index_ecran_sauve = monde.ecrans.indexOf(ecran);
		
		stage.removeChild(grid);
		
		clearCanvas();
		clearAdjacentCanvas();
		
		items_all_edit = loadWorldOnCanvas();
		
		stage.update();
	}
}

function loadWorldOnCanvas() {
	var items_return = {};
	
	var lim_x = {min: 0, max: 0};
	var lim_y = {min: 0, max: 0};
	
	monde.ecrans.forEach(function(e) {
		if (e.position.x < lim_x.min) lim_x.min = e.position.x;
		if (e.position.x > lim_x.max) lim_x.max = e.position.x;
		if (e.position.y < lim_y.min) lim_y.min = e.position.y;
		if (e.position.y > lim_y.max) lim_y.max = e.position.y;
	});
	
	if (mode == 'edit') {
		stage.scaleX = 1 / (lim_x.max - lim_x.min + 1);
		stage.scaleY = 1 / (lim_y.max - lim_y.min + 1);
		
		document.getElementById("path").innerHTML = monde.nom + " > Tous les ecrans";
	}
	
	monde.ecrans.forEach(function(e) {
		if (e.position.x != undefined && e.position.y != undefined) {
			items_return[e.nom] = {};
			config.item.type.forEach(function(type) {
				items_return[e.nom][type] = [];
				e[type+"s"].forEach(function(item) {
					var new_param = {
						'x': (e.position.x - lim_x.min) * config.taille.w + item.x, 
						'y': (e.position.y - lim_y.min) * config.taille.h + item.y, 
						'w': item.w, 'h': item.h, 'couleur': item.couleur, 'sprite': item.sprite , 'proprietes': item.proprietes};
					
					items_return[e.nom][type].push({ param: new_param, obj: createItem(stage, type, new_param) });
				});
			});
		}
	});
	
	return items_return;
}