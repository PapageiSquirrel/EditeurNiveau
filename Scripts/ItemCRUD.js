function changeCurrentItem(type) {
	var edition_items = document.getElementById("editionItems");
	for (var i = edition_items.childNodes.length-1 ; i > 0 ; i--) {
		edition_items.removeChild(edition_items.childNodes[i]);
	}
	
	current_prop = null;
	for (prop in config.item.proprietes[type]) {
		createListElement(edition_items, "col-xs-12", prop, "proprietes", changeCurrentItemProp);
	}
}

function changeCurrentItemProp(id) {
	if (current_item) {
		current_prop = id;
	}
}

function changeCurrentItemType(type) {
	current_type = type;
	
	changeCurrentItem(type);
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
	var path = "img/";
	
	getListFiles(path, function(list) {
		var ul;
		if (mode == 'edit')	ul = document.getElementById("spriteBank");
		
		var manifest_body = [];
		
		for(var i = 0 ; i < list.length ; i++) {
			var img = document.createElement("img");
			img.onload = function() {
				var id = this.src.slice(this.src.lastIndexOf("/")+1, this.src.indexOf("."));
				sprites[id] = { 'id': id, 'naturalWidth': this.width, 'naturalHeight': this.height };
			}
			img.src = path + list[i];
			
			if (mode == 'edit') {
				createListElement(ul, "col-xs-6", list[i].slice(0, list[i].indexOf(".")), "image", changeCurrentSprite, path + list[i]);
			}
			
			
			manifest_body.push({"id": list[i].slice(0, list[i].indexOf(".")), "src": list[i]});
		}
		
		callback({"path": path, "manifest": manifest_body});
	});
}

function createListElement(ul, li_size, input_id, input_name, fn_oc, label_bi=undefined) {
	var li = document.createElement("li");
	li.className = li_size + " nopadding";
	
	var input = document.createElement("input");
	input.type = "radio";
	input.id = input_id;
	input.name = input_name;
	input.onclick = function() { fn_oc(input.id); }
	
	var label = document.createElement("label");
	label.htmlFor = input.id;
	label.className = "btn-block";
	if (label_bi) label.style.backgroundImage = "url(" + label_bi + ")";
	
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

function createLine(st, x, y, w, h) {
	var line = new createjs.Shape();
	
	line.graphics.setStrokeStyle(2);
	line.graphics.beginStroke("#0000FF"); // bleu ?
	line.graphics.moveTo((x+0.5) * config.pixel.w, (y+0.5) * config.pixel.h);
	line.graphics.lineTo((x+w-0.5) * config.pixel.w, (y+h-0.5) * config.pixel.h);
	
	st.addChild(line);
	return line;
}

function createItem(st, type, param) {
	switch (type) {
		case 'plateforme':
			return createPlateform(st, param.x, param.y, param.w, param.h, param.couleur, param.sprite);
			break;
		case 'loot':
			return createLoot(st, param.x, param.y, param.w, param.h, param.s);
			break;
		case 'decor':
			return createDecor(st, param.x, param.y, param.w, param.h, param.couleur, param.sprite);
			break;
	}
}

function createItemProp(type, prop, param) {
	var prop_info = config.item.proprietes[type][prop];
	var res = {};
	
	for (p_name in prop_info) {
		if (p_name == "representation") {
			if (prop_info[p_name]) {
				res[p_name] = {'x': param.x, 'y': param.y, 'w': param.w, 'h': param.h};
				createLine(stage, param.x, param.y, param.w, param.h);
			}
		} else {
			
		}
	}
	
	return res;
}

function createPlateform(st, x, y, w, h, couleur, id_sprite) {
	var pf;
	
	if (id_sprite) {
		var s = sprites[id_sprite];
		var ss = new createjs.SpriteSheet({
			frames: {width: s.naturalWidth, height: s.naturalHeight},
			images: [preload.getResult(s.id)]
		});
		
		var rgb = getRGB(config.palette[couleur.base][couleur.nuance]);
		var f = new createjs.ColorFilter(0, 0, 0, 1, rgb[0], rgb[1], rgb[2], 0);
		
		pf = new createjs.Sprite(ss);
		pf.filters = [f];
		pf.setTransform(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w / s.naturalWidth, h * config.pixel.h / s.naturalHeight);
		var pf_img = pf.clone();
		pf.cache(0, 0, s.naturalWidth, s.naturalHeight);
	} else {
		var graph = new createjs.Graphics().beginLinearGradientFill(["#FFFFFF", config.palette[couleur.base][couleur.nuance]], [0, 0.1], 0, y * config.pixel.h, 0, (y + h) * config.pixel.h).drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
		pf = new createjs.Shape(graph);
	}
	
	st.addChild(pf);
	return pf;
}

function createLoot(st, x, y , w, h, s) {
	var ss_fond = new createjs.SpriteSheet({
		frames: { width: 874, height: 1404},
		images: [preload.getResult("fondJeu")]
	});
	fond = new createjs.Sprite(ss_fond);
	fond.setTransform(0, 0, taille_ecran.width/874, taille_ecran.height/1404);
	
	st.addChild(pf_shape);
	return pf_shape;
}

function createDecor(st, x, y , w, h, couleur, id_sprite) {
	var decor;
	
	if (id_sprite) {
		var s = sprites[id_sprite];
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

function deleteItem(type, item) {
	if (item) {
		if (item.obj.constructor === Array) {
			item.obj.forEach(function(o) {
				stage.removeChild(o);
			});
		} else {
			stage.removeChild(item.obj);
		}
		
		for(var i = items_edit[type].length-1; i >= 0 ; i--) { 
			if (items_edit[type][i] == item) items_edit[type].splice(i, 1);
		}
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

/*
function checkConstraint(name) {
	switch(name) {
		case 'prop_mouvement':
			if ()
			break;
	}
}
*/