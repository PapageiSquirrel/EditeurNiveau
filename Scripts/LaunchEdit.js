// GLOBALES
var grid;
// SPRITES
var items_all_edit, items_edit;
// CREATION
var current_type, current_item, current_prop, current_sprite, current_color, current_nuance, cadre_sel, hold;
// NAVIGATION
var ecrans_necessaires, ecrans_adjacents, stage_adjacents, stage_global, index_ecran_sauve;

function initEdit() {
	// INIT VARIABLES
	stage_adjacents = {};
	index_ecran_sauve = -1;
	ecrans_adjacents = {};
	ecrans_necessaires = { 'haut': false, 'bas': false, 'gauche': false, 'droite': false };
	items_edit = {'plateforme': [], 'loot': [], 'decor': []};
	items_all_edit = {'plateforme': [], 'loot': [], 'decor': []};
	current_type = 'plateforme';
	changeCurrentColor('noir');
	cadre_sel = stage.addChild(new createjs.Shape());
	// FIN INIT 
	
	createGrid();
	loadExistingWorlds();
}

function initEditHandler() {
	stage.addEventListener("stagemousedown", handleMouseDown);
	stage.addEventListener("stagemouseup", handleMouseUp);
	stage.addEventListener("stagemousemove", handleMouseMove);
	
	window.addEventListener('keydown', function(e) {
		if (e.keyCode == 46 && current_item) {
			if (current_prop) {
				deleteItemProp(current_item, current_prop);
			} else {
				deleteItem(current_type, current_item);
			
				current_item = null;
			}
			
			cadre_sel.graphics.clear();
			stage.update();
		}
	});
}

// EVENTS
function handleMouseDown(event) {
	var param = {};
	
	if (!current_prop || !current_item) {
		var found_one = config.item.type.some(function(type) {
			if (current_type == 'decor' || current_type != 'decor' && type != 'decor') {
				return items_edit[type].some(function(item) {
					var o = (item.obj.constructor === Array ? item.obj[0] : item.obj);
					if (item.param.sprite) { 
						var pt = o.globalToLocal(event.stageX, event.stageY);
						if (o.hitTest(pt.x, pt.y)) {
							current_item = item;
							changeCurrentItemType(type);
							current_prop = null;
							return true;
						}
					} else if (o && o.hitTest(event.stageX, event.stageY)) {
						current_item = item;
						changeCurrentItemType(type);
						return true;
					}
				});
			}
		}); 
		
		if (!found_one) {
			param = { 
				x: Math.floor(event.stageX/config.pixel.w), 
				y: Math.floor(event.stageY/config.pixel.h), 
				w: 1, 
				h: 1, 
				couleur: {'base': current_color, 'nuance': current_nuance},
				sprite: current_sprite
			};
			
			current_item = { param: param, obj: createItem(stage, current_type, param) };
			current_prop = null;
			hold = true;
		}
		
		if (current_item) {
			createCadre(current_item.param.x, current_item.param.y, current_item.param.w, current_item.param.h);
		}
	} else {
		// TODO: => current_item.proprietes.add(current_prop);
		if (!current_item.param.proprietes) {
			current_item.param.proprietes = {};
		} 
		if (!current_item.proprietes) {
			current_item.proprietes = {};
		}
		
		if (current_item.param.proprietes[current_prop]) {
			if (config.item.proprietes[current_type][current_prop].representation) {
				// TODO: sélection si représentation
				var prop = current_item.param.proprietes[current_prop].representation;
				createCadre(prop.x, prop.y, prop.w, prop.h);
			} else {
				console.log('existe, mais pas de representation.');
			}
		} else {
			// TODO: création
			if (config.item.proprietes[current_type][current_prop].representation) {
				/*
				param = { 
					x: current_item.param.x < Math.floor(event.stageX/config.pixel.w) ? current_item.param.x : Math.floor(event.stageX/config.pixel.w), 
					y: current_item.param.y < Math.floor(event.stageY/config.pixel.h) ? current_item.param.y : Math.floor(event.stageY/config.pixel.h), 
					w: current_item.param.x > Math.floor(event.stageX/config.pixel.w) ? (current_item.param.x + current_item.param.w) - Math.floor(event.stageX/config.pixel.w) +1 : Math.floor(event.stageX/config.pixel.w) - current_item.param.x +1, 
					h: current_item.param.y > Math.floor(event.stageY/config.pixel.h) ? (current_item.param.y + current_item.param.h) - Math.floor(event.stageY/config.pixel.h) +1 : Math.floor(event.stageY/config.pixel.h) - current_item.param.y +1,
				};
				*/
				
				param = {
					x: current_item.param.x,
					y: current_item.param.y,
					w: Math.floor(event.stageX/config.pixel.w) - current_item.param.x +1,//(current_item.param.x > Math.floor(event.stageX/config.pixel.w) ? 0 : 1),
					h: Math.floor(event.stageY/config.pixel.h) - current_item.param.y +1//(current_item.param.y > Math.floor(event.stageY/config.pixel.h) ? 0 : 1)
				}
				
				var new_prop = createItemProp(current_type, current_prop, param);
				current_item.param.proprietes[current_prop] = new_prop.param;
				current_item.proprietes[current_prop] = new_prop.obj;
				
				if (param.w <= 0) {
					var new_x, new_w;
					new_x = new Number(param.x+param.w-1);
					new_w = new Number(param.w*(-1)+2);
					param.x = new_x;
					param.w = new_w; 
				}
				if (param.h <= 0) { 
					var new_y, new_h;
					new_y = new Number(param.y+param.h-1);
					new_h = new Number(param.h*(-1)+2);
					param.y = new_y;
					param.h = new_h;
				}
				createCadre(param.x, param.y, param.w, param.h);
				
				// hold = true;
			} else {
				console.log('n\'existe pas et pas de representation.');
			}
		}
	}
	
	stage.update();
}

function handleMouseMove(event) {
	if (hold) {
		if (current_prop) {
			
		} else if ((current_item.param.x > Math.floor(event.stageX/config.pixel.w) || current_item.param.x + current_item.param.w-1 < Math.floor(event.stageX/config.pixel.w)) 
			|| (current_item.param.y > Math.floor(event.stageY/config.pixel.h) || current_item.param.y + current_item.param.h-1 < Math.floor(event.stageY/config.pixel.h))) {
			
			var extended_item = { 
				x: current_item.param.x < Math.floor(event.stageX/config.pixel.w) ? current_item.param.x : Math.floor(event.stageX/config.pixel.w), 
				y: current_item.param.y < Math.floor(event.stageY/config.pixel.h) ? current_item.param.y : Math.floor(event.stageY/config.pixel.h), 
				w: current_item.param.x > Math.floor(event.stageX/config.pixel.w) || current_item.param.x + current_item.param.w-1 < Math.floor(event.stageX/config.pixel.w) ? current_item.param.w+1 : current_item.param.w, 
				h: current_item.param.y > Math.floor(event.stageY/config.pixel.h) || current_item.param.y + current_item.param.h-1 < Math.floor(event.stageY/config.pixel.h) ? current_item.param.h+1 : current_item.param.h,
				couleur: {'base': current_color, 'nuance': current_nuance},
				sprite: current_sprite
			};

			deleteItem(current_type, current_item);
			
			current_item.param = extended_item;
			current_item.obj = createItem(stage, current_type, extended_item);
			
			createCadre(current_item.param.x, current_item.param.y, current_item.param.w, current_item.param.h);
		}
				
		stage.update();
	}
}

function handleMouseUp(event) {
	if (hold) {
		hold = false;
		items_edit[current_type].push(current_item);
	}
}
// Fin
