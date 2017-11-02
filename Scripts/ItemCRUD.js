function changeCurrentItem(type) {
	var edition_items = document.getElementById("editionItems");
	for (var i = edition_items.childNodes.length-1 ; i > 0 ; i--) {
		edition_items.removeChild(edition_items.childNodes[i]);
	}
	
	current_prop = null;
	deleteAjustmentVariables();
	if (current_item) {
		for (prop in config.item.proprietes[type]) {
			createListElement(edition_items, "col-xs-12", prop, "proprietes", changeCurrentItemProp, config.item.proprietes[type][prop].img ? "img/assets/" + config.item.proprietes[type][prop].img : null);
		}
	} else {
		cadre_sel.graphics.clear();
		stage.update();
	}
}

function changeCurrentItemProp(id) {
	if (current_item) {
		current_prop = id;

		deleteAjustmentVariables();
		
		if (!current_item.param.proprietes) {
			current_item.param.proprietes = {};
		}
		
		if (!current_item.param.proprietes[id]) {
			createAjustmentVariables(current_type, id);
		} else {
			addAjustmentVariables(current_type, id);
		}
	}
}

function changeCurrentItemType(type) {
	current_type = type;
	
	var ul = document.getElementById("spriteBank");
	for (var i = ul.childNodes.length-1 ; i > 1 ; i--) {
		ul.removeChild(ul.childNodes[i]);
	}
	for (s in sprites[type]) {
		createListElement(ul, "col-xs-6", s, "image", changeCurrentSprite, "img/sprites/" + type + "/" + s + ".png");
	}
	
	changeCurrentItem(type);
	changeCurrentSprite();
}

function changeCurrentColor(couleur) {
	current_color = couleur;
	current_nuance = 0;
	
	for (var i = 1 ; i <= 4 ; i++) {
		var label_nuance = document.getElementById("nuance" + i);
		label_nuance.style.backgroundColor = config.palette[current_color][i];
	}
}

function changeCurrentNuance(num) {
	current_nuance = num;
}

function changeCurrentSprite(id=undefined) {
	current_sprite = id;
}

function loadSpriteBank(callback) {
	var path = "img/sprites/";
	
	getListFilesInSubdir(path, function(list) {
		var manifest_body = [];

		for (type in list) {
			sprites[type] = {};
			for(var i = 0 ; i < list[type].length ; i++) {
				var img = document.createElement("img");
				img.onload = function() {
					var id = this.src.slice(this.src.lastIndexOf("/")+1, this.src.indexOf("."));
					var type = this.src.slice(this.src.lastIndexOf("sprites/")+8, this.src.lastIndexOf("/"));
					sprites[type][id] = { 'id': id, 'naturalWidth': this.width, 'naturalHeight': this.height };
				}
				img.src = path + type + '/' + list[type][i];
				
				manifest_body.push({"id": list[type][i].slice(0, list[type][i].indexOf(".")), "src": type + '/' + list[type][i]});
			}
		}
		
		callback({"path": path, "manifest": manifest_body});
	});
}

function loadUI(callback) {
	var path = "img/ui/";
	
	getListFiles(path, function(list) {
		var manifest_body = [];

		for(var i = 0 ; i < list.length ; i++) {
			var id = list[i].slice(0, list[i].indexOf("."));
			manifest_body.push({"id": id, "src": list[i]});
		}
		
		callback({"path": path, "manifest": manifest_body});
	});
}

function loadMusics(callback) {
	var path = "musics/";
	
	getListFilesInSubdir(path, function(list) {
		var manifest_body = [];

		for (format in list) {
			musics[format] = {};
			for(var i = 0 ; i < list[format].length ; i++) {
				var id = list[format][i].slice(0, list[format][i].indexOf("."));
				musics[format][id] = id + format;
				manifest_body.push({"id": id + format, "src": format + '/' + list[format][i]});
			}
		}
		
		callback({"path": path, "manifest": manifest_body});
	});
}


function deleteAjustmentVariables() {
	var div = document.getElementById("varaju");
	if (div.childElementCount > 0) {
		for(var i = div.childNodes.length-1 ; i >= 0 ; i--) {
			div.removeChild(div.childNodes[i]);
		}
	}
}

function addAjustmentVariables(type, prop) {
	var prop_info = config.item.proprietes[type][prop];
	var div = document.getElementById("varaju");
	
	if (prop_info.configurable) {
		prop_info.configurable.forEach(function(var_aju) {
			if (var_aju.format == "number" || var_aju.format == "text") {
				var input = document.createElement("input");
				input.type = "text";
				input.id = var_aju.name;
				input.name = var_aju.name;
				input.className = "col-xs-6 nopadding";
				if (current_item && current_item.param.proprietes && current_item.param.proprietes[prop] && current_item.param.proprietes[prop][var_aju.name]) {
					input.value = current_item.param.proprietes[prop][var_aju.name];
				} else {
					input.value = var_aju.defaut;
				}
				input.onchange = function() {
					if (this.value) {
						editItemProp(prop, this.name, var_aju.format, this.value);
					}
				}
				
				var label = document.createElement("label");
				label.htmlFor = input.id;
				label.innerHTML = var_aju.name;
				label.className = "col-xs-6 nopadding";
				
				div.appendChild(label);
				div.appendChild(input);
			} else if (var_aju.format == "boolean") {
				var label = document.createElement("label");
				label.innerHTML = var_aju.name;
				label.className = "col-xs-12 nopadding";
					
				div.appendChild(label);
				
				var_aju.options.forEach(function(opt) {
					var input = document.createElement("input");
					input.type = "checkbox";
					input.id = opt;
					input.name = var_aju.name;
					input.value = opt;
					input.className = "col-xs-4 nopadding";
					
					if (current_item && current_item.param.proprietes && current_item.param.proprietes[prop] && current_item.param.proprietes[prop][var_aju.name]) {
						input.checked = current_item.param.proprietes[prop][var_aju.name].indexOf(opt) != -1;
					} else {
						input.checked = false;
					}
					
					input.onchange = function() {
						editItemProp(prop, this.name, var_aju.format, {'option': this.value, 'checked': this.checked});
					}
					
					var label = document.createElement("label");
					label.htmlFor = input.id;
					label.innerHTML = opt;
					label.className = "col-xs-8 nopadding";
					
					div.appendChild(label);
					div.appendChild(input);
				});
			}
		});
	}
	
	if (!prop_info.representation) {
		div.removeChild(document.getElementById("btnVarAju"));
		createItemProp(type, prop);
	}
	
}

function createAjustmentVariables(type, prop) {
	var prop_info = config.item.proprietes[type][prop];
	
	try {
		if (prop_info.configurable) {
			var div = document.getElementById("varaju");
			
			if (!prop_info.representation) {
				var btn = document.createElement("button");
				btn.id = "btnVarAju";
				btn.name = "btnVarAju";
				btn.innerHTML = "Ajouter";
				btn.onclick = function() {
					addAjustmentVariables(type, prop);
				}
				div.appendChild(btn);
			}
		}
	} catch(e) {
		console.log(e, type, prop);
	}
	
}

function createListElement(ul, li_size, input_id, input_name, fn_oc, label_bi=undefined) {
	var li = document.createElement("li");
	li.className = li_size + " nopadding max-width-40";
	
	var input = document.createElement("input");
	input.type = "radio";
	input.id = input_id;
	input.name = input_name;
	input.onclick = function() { fn_oc(input.id); }
	
	var label = document.createElement("label");
	label.htmlFor = input.id;
	label.className = "btn-block";
	if (label_bi) {
		label.style.backgroundImage = "url(" + label_bi + ")";
		label.style.backgroundPosition = "left";
		var s;
		var found = config.sprites.some(function(sp) {
			if (sp.nom == input_id) {
				s = sp;
				return true;
			}
		});
		
		if (found) {
			label.style.backgroundSize = 120 + "px " + 40 + "px";
		}
	}
	
	label.appendChild(document.createElement("div"));
	li.appendChild(input);
	li.appendChild(label);
	ul.appendChild(li);
}

function createGrid() {
	grid = new createjs.Shape();
	
	grid.graphics.setStrokeStyle(1);
	grid.graphics.beginStroke("#000000");
	for (var pos = 1 ; pos < config.taille.w ; pos++) {
		grid.graphics.moveTo(pos * config.pixel.w, 0);
		grid.graphics.lineTo(pos * config.pixel.w, config.taille.h * config.pixel.h);
	}
	for (var pos = 1 ; pos < config.taille.h ; pos++) {
		grid.graphics.moveTo(0, pos * config.pixel.h);
		grid.graphics.lineTo(config.taille.w * config.pixel.w, pos * config.pixel.h);
	}
}

function createCadre(x, y, w, h) {
	cadre_sel.graphics.clear();
	cadre_sel.graphics.setStrokeStyle(2);
	// TODO: changer la couleur
	cadre_sel.graphics.beginStroke("red").drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
}

function createItem(st, type, param, withProp=true) {
	var created_item = {};
	var param_clone = {};
	
	for (p in param) {
		if (withProp && param.proprietes && p == "proprietes") {
			param_clone[p] = {};
			for (prop in param[p]) {
				param_clone[p][prop] = {};
				if (param[p][prop].representation) {
					param_clone[p][prop].representation = {};
					if (!param.proprietes[prop].representation.param) {
						param_clone[p][prop].representation.param = JSON.parse(JSON.stringify(param[p][prop].representation));
					} else {
						param_clone[p][prop].representation.param = JSON.parse(JSON.stringify(param[p][prop].representation.param));
					}
				}
			}
		} else {
			param_clone[p] = param[p] != undefined ? JSON.parse(JSON.stringify(param[p])) : undefined;
		}
	}
	created_item.param = param_clone;

	created_item.obj = drawItem(st, type, param.x, param.y, param.w, param.h, param.couleur, param.sprite);
	
	current_item = created_item;
	
	// TODO : Créer les propriétés de l'objet
	if (withProp && param.proprietes) {
		for (prop in param.proprietes) {
			for (va in param.proprietes[prop]) {
				if ((mode == "edit" || prop == "traversable") && va == "representation" && param.proprietes[prop].representation) {
					var param_sauve = JSON.parse(JSON.stringify(created_item.param.proprietes[prop].representation.param));
					created_item.param.proprietes[prop].representation.obj = createGraphProp(st, prop, param_sauve);
				} else {
					created_item.param.proprietes[prop][va] = JSON.parse(JSON.stringify(param.proprietes[prop][va]));
				}
			}
		}
	}
	
	current_item = null;

	// TEST REG
	//created_item.obj.regX = param.w * config.pixel.w;
	
	return created_item;
}

function copyItem(x, y) {
	var param_clone = {};
	var param = current_item.param;
	
	for (p in param) {
		if (param.proprietes && p == "proprietes") {
			param_clone[p] = {};
			for (prop in param[p]) {
				param_clone[p][prop] = {};
				for (va in param[p][prop]) {
					if (va == "representation") {
						param_clone[p][prop].representation = {};
						param_clone[p][prop].representation.param = JSON.parse(JSON.stringify(param[p][prop].representation.param));
						
						var new_param = param_clone[p][prop].representation.param;
						var old_param = param[p][prop].representation.param;
						switch(prop) {
							case 'mouvement':
								new_param.x1 = x;
								new_param.y1 = y;
								new_param.x2 = x + old_param.x2 - old_param.x1;
								new_param.y2 = y + old_param.y2 - old_param.y1;
								break;
							default:
								new_param.x = x;
								new_param.y = y;
								break;
						}
					} else {
						param_clone[p][prop][va] = param[p][prop][va] != undefined ? JSON.parse(JSON.stringify(param[p][prop][va])) : undefined;
					}
				} 
			}
		} else {
			try {
				param_clone[p] = param[p] != undefined ? JSON.parse(JSON.stringify(param[p])) : undefined;
			} catch(e) {
				console.log(e);
				console.log(p, param);
			}
		}
	}
	
	param_clone.x = x;
	param_clone.y = y;
	
	return createItem(stage, current_type, param_clone);
}

function createItemProp(type, prop, param=undefined) {
	var prop_info = config.item.proprietes[type][prop];
	var res = {};
	
	for (p_name in prop_info) {
		if (p_name == "representation") {
			if (prop_info[p_name] && param) {
				res[p_name] = createProp(stage, prop, param[p_name]);
			}
		} else if (p_name == "img") {
			
		} else if (p_name == "configurable") {
			prop_info[p_name].forEach(function(var_aju) {
				if (current_item && current_item.param.proprietes && current_item.param.proprietes[prop]) {
					res[var_aju.name] = current_item.param.proprietes[prop][var_aju.name];
				} else {
					if (var_aju.defaut) {
						res[var_aju.name] = var_aju.defaut;
					} else if (var_aju.options) {
						res[var_aju.name] = [];
					}
				}
			});
		}
	}

	return res;
}

function editItemProp(prop, name, format, value) {
	if (current_item && current_item.param.proprietes && current_item.param.proprietes[prop] && !current_item.param.proprietes[prop][name]) {
		current_item.param.proprietes[prop][name] = null;
	}
	
	if (current_item && current_item.param.proprietes && current_item.param.proprietes[prop] && value) {
		var prop_sauve = current_item.param.proprietes[prop];
		
		if (format == "text") {
			prop_sauve[name] = value;
			if (prop_sauve.representation.obj) prop_sauve.representation.obj.text = value;
			stage.update();
		}
		if (format == "number")	prop_sauve[name] = Number(value);
		if (format == "boolean") {
			if (!prop_sauve[name]) prop_sauve[name] = [];
			if (value.checked) prop_sauve[name].push(value.option);
			else prop_sauve[name].splice(prop_sauve[name].indexOf(value.option), 1);
		}
	}
}

function drawItem(st, type, x, y, w, h, couleur, id_sprite) {
	var pf;
	if (id_sprite) {
		pf = new createjs.Container();
		
		var s = sprites[type][id_sprite];
		
		var sprite;
		var found = config.sprites.some(function(sp) {
			if (sp.nom == s.id) {
				sprite = sp;
				return true;
			}
		});
		
		var ss, sub_pf;
		if (found) {
			ss = new createjs.SpriteSheet({
				frames: {width: sprite.w, height: sprite.h},
				images: [preload.getResult(s.id)]
			});
			sub_pf = new createjs.Sprite(ss);
			sub_pf.setTransform(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w / sprite.w, h * config.pixel.h / sprite.h);
		} else {
			ss = new createjs.SpriteSheet({
				frames: {width: s.naturalWidth, height: s.naturalHeight},
				images: [preload.getResult(s.id)]
			});
			sub_pf = new createjs.Sprite(ss);
			sub_pf.setTransform(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w / s.naturalWidth, h * config.pixel.h / s.naturalHeight);
		}
		
		pf.addChild(sub_pf);
		
		sub_pf = sub_pf.clone();
		if (couleur.base != "noir") {
			var rgb = getRGB(config.palette[couleur.base][couleur.nuance]);
			var f = new createjs.ColorFilter(0, 0, 0, 0.5, rgb[0], rgb[1], rgb[2], 0);
			sub_pf.filters = [f];
		}
		sub_pf.cache(0, 0, s.naturalWidth, s.naturalHeight);
		pf.addChild(sub_pf);

		pf.setBounds(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
	} else {
		//var graph = new createjs.Graphics().beginLinearGradientFill(["#FFFFFF", config.palette[couleur.base][couleur.nuance]], [0, 0.1], 0, y * config.pixel.h, 0, (y + h) * config.pixel.h).drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
		var graph = new createjs.Graphics().beginFill(config.palette[couleur.base][couleur.nuance]).drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
		pf = new createjs.Shape(graph);
		pf.setBounds(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
	}
	
	if (mode == "game" && (type == "decor" || type == "loot")) st.addChildAt(pf, 0);
	else st.addChild(pf);
	return pf;
}

/*
function createLoot(st, x, y , w, h, couleur, id_sprite) {
	var loot;
	
	if (id_sprite) {
		var s = sprites['loot'][id_sprite];
		var ss = new createjs.SpriteSheet({
			frames: {width: s.naturalWidth, height: s.naturalHeight},
			images: [preload.getResult(s.id)]
		});
		
		var rgb = getRGB(config.palette[couleur.base][couleur.nuance]);
		var f = new createjs.ColorFilter(0, 0, 0, 1, rgb[0], rgb[1], rgb[2], 0);
		
		loot = new createjs.Sprite(ss);
		loot.filters = [f];
		loot.setTransform(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w / s.naturalWidth, h * config.pixel.h / s.naturalHeight);
		var loot_img = loot.clone();
		loot.cache(0, 0, s.naturalWidth, s.naturalHeight);
	} else {
		var graph = new createjs.Graphics().beginLinearGradientFill(["#FFFFFF", config.palette[couleur.base][couleur.nuance]], [0, 0.1], 0, y * config.pixel.h, 0, (y + h) * config.pixel.h).drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
		loot = new createjs.Shape(graph);
	}
	
	st.addChild(loot);
	return loot;
}

function createDecor(st, x, y , w, h, couleur, id_sprite) {
	var decor;
	
	if (id_sprite) {
		var s = sprites['decor'][id_sprite];
		var ss = new createjs.SpriteSheet({
			frames: {width: s.naturalWidth, height: s.naturalHeight},
			images: [preload.getResult(s.id)]
		});
		
		var rgb = getRGB(config.palette[couleur.base][couleur.nuance]);
		var f = new createjs.ColorFilter(0, 0, 0, 1, rgb[0], rgb[1], rgb[2], 0);
		
		decor = new createjs.Sprite(ss);
		decor.filters = [f];
		decor.setTransform(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w / s.naturalWidth, h * config.pixel.h / s.naturalHeight);
		var decor_img = decor.clone();
		decor.cache(0, 0, s.naturalWidth, s.naturalHeight);
	} else {
		var graph = new createjs.Graphics().beginLinearGradientFill(["#FFFFFF", config.palette[couleur.base][couleur.nuance]], [0, 0.5], 0, y * config.pixel.h, 0, (y + h) * config.pixel.h).drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
	
		decor = new createjs.Shape(graph);
	}
	
	st.addChild(decor);
	return decor;
}
*/

function deleteItem(type, item) {
	if (item) {
		stage.removeChild(item.obj);
		
		if (mode == 'edit') {
			for(var i = items_edit[type].length-1; i >= 0 ; i--) { 
				if (items_edit[type][i] == item) items_edit[type].splice(i, 1);
			}
		} else if (mode == 'game') {
			for(var i = items_game[ecran.nom][type].length-1; i >= 0 ; i--) { 
				if (items_game[ecran.nom][type][i] == item) items_game[ecran.nom][type].splice(i, 1);
			}
		}
	}
}

function deleteItemProp(item, prop) {
	if (item && prop) {
		var item_prop = item.param.proprietes[prop];
		if (item_prop) {
			if (item_prop['representation']) {
				try {
					stage.removeChild(item_prop['representation'].obj);
				} catch(e) {
					console.log(e);
					console.log(item);
				}
				
			}
		}
		
		deleteAjustmentVariables();
	}
}

function getRGB(couleur) {
	var rgb = [];
	
	for (var i = 1 ; i < 7 ; i += 2) {
		var c = parseInt(couleur.slice(i, i+2), 16);
		rgb.push(c);
	}
	
	return rgb; 
}