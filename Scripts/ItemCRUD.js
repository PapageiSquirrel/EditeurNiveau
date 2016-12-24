function changeCurrentItem(type) {
	var edition_items = document.getElementById("editionItems");
	for (var i = edition_items.childNodes.length-1 ; i > 0 ; i--) {
		edition_items.removeChild(edition_items.childNodes[i]);
	}
	
	var radio_type = document.getElementById(type);
	radio_type.checked = true;
	
	current_prop = null;
	for (prop in config.item.proprietes[type]) {
		createListElement(edition_items, "col-xs-12", prop, "proprietes", changeCurrentItemProp);
	}
	
	if (current_item.proprietes) {
		for (prop in current_item.proprietes) {
			stage.addChild(current_item.proprietes[prop]);
		}
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
	return createItemOnCanvas(st, param.x, param.y, param.w, param.h, param.couleur, param.sprite);
}

function createItemProp(type, prop, param) {
	var prop_info = config.item.proprietes[type][prop];
	var res = {'param': {}, 'obj': []};
	
	for (p_name in prop_info) {
		if (p_name == "representation") {
			if (prop_info[p_name]) {
				res.param[p_name] = {'x': param.x, 'y': param.y, 'w': param.w, 'h': param.h};
				res.obj.push(createLine(stage, param.x, param.y, param.w, param.h));
			}
		} else {
			
		}
	}
	
	return res;
}

function createItemOnCanvas(st, x, y, w, h, couleur, id_sprite) {
	var item;
	
	if (id_sprite) {
		var s = sprites[id_sprite];
		var ss = new createjs.SpriteSheet({
			frames: {width: s.naturalWidth, height: s.naturalHeight},
			images: [preload.getResult(s.id)]
		});
		
		var rgb = getRGB(config.palette[couleur.base][couleur.nuance]);
		var f = new createjs.ColorFilter(0, 0, 0, 1, rgb[0], rgb[1], rgb[2], 0);
		
		item = new createjs.Sprite(ss);
		item.filters = [f];
		item.setTransform(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w / s.naturalWidth, h * config.pixel.h / s.naturalHeight);
		var pf_img = item.clone();
		item.cache(0, 0, s.naturalWidth, s.naturalHeight);
	} else {
		var graph = new createjs.Graphics().beginLinearGradientFill([getLighterColor(config.palette[couleur.base][couleur.nuance]), config.palette[couleur.base][couleur.nuance], config.palette[couleur.base][couleur.nuance], getDarkerColor(config.palette[couleur.base][couleur.nuance])], [0, 0.1, 0.9, 1], 0, y * config.pixel.h, 0, (y + h) * config.pixel.h).drawRect(x * config.pixel.w, y * config.pixel.h, w * config.pixel.w, h * config.pixel.h);
		item = new createjs.Shape(graph);
	}
	
	st.addChild(item);
	return item;
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

function deleteItemProp(item, prop) {
	if (item && item.proprietes && prop) {
		for(var i = 0 ; i < item.proprietes[prop].length ; i++){
			stage.removeChild(item.proprietes[prop][i]);
		}
		
		item.proprietes[prop] = undefined;
		item.param.proprietes[prop] = undefined;
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

function getHexa(rgb) {
	var hexa = "#";
	for (var i = 0 ; i < 3 ; i++) {
		var c_h = parseInt(rgb[i],10).toString(16).toUpperCase();
		if (c_h.length < 2) c_h = "0" + c_h;
		hexa += c_h;
	}
	return hexa;
}

function getLighterColor(couleur) {
	var rgb = getRGB(couleur)
	for (var i = 0 ; i < 3 ; i++) {
		rgb[i] = (rgb[i]+255)/2;
	}
	return getHexa(rgb);
}

function getDarkerColor(couleur) {
	var rgb = getRGB(couleur)
	for (var i = 0 ; i < 3 ; i++) {
		rgb[i] = rgb[i]/2;
	}
	return getHexa(rgb);
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