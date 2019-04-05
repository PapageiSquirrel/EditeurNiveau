// GLOBALES
var grid;
// SPRITES
var items_all_edit, items_edit;
// CREATION
var current_type, current_item, current_prop, current_sprite, current_color, current_nuance, cadre_sel, hold_create, hold_select, pt_select;
// NAVIGATION
var ecrans_necessaires, ecrans_adjacents, stage_adjacents, stage_global, index_ecran_sauve;

function initEdit() {
	// INIT VARIABLES
	stage_adjacents = {};
	index_ecran_sauve = -1;
	ecrans_adjacents = {};
	ecrans_necessaires = { 'haut': false, 'bas': false, 'gauche': false, 'droite': false };
	items_edit = {'plateforme': [], 'loot': [], 'decor': [], 'ennemi': []};
	items_all_edit = {'plateforme': [], 'loot': [], 'decor': [], 'ennemi': []};
	// current_type = 'plateforme';
	current_type = undefined;
	current_prop = undefined;
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
		if (e.keyCode == 46) {
			if (current_item && current_prop){
				deleteItemProp(current_item, current_prop);
				current_item.param.proprietes[current_prop] = null;
			} else if (current_item) {
				for (prop in current_item.param.proprietes) {
					deleteItemProp(current_item, prop);
					current_item.param.proprietes[prop] = null;
				}
				deleteItem(current_type, current_item);
			
				current_item = null;
				changeCurrentItem(current_type);
				
				cadre_sel.graphics.clear();
			}
			
			stage.update();
		} else if (e.keyCode == 68) {
			if (current_item) {
				items_edit[current_type].push(copyItem(Math.floor(stage.mouseX/config.pixel.w), Math.floor(stage.mouseY/config.pixel.h)));
				
				stage.update();
			}
		}
	});
}

// EVENTS
function handleMouseDown(event) {
	var param = {};
	
	if (!current_type || !current_prop || !current_item) {
		var found_one = config.item.type.some(function(type) {
			return items_edit[type].some(function(item) {
				var o = item.obj;
				var pt = o.globalToLocal(event.stageX, event.stageY);

				if (item.param.sprite) { 
					if (o.hitTest(pt.x, pt.y)) {
						current_item = item;
						changeCurrentItemType(type);
						document.getElementById(type).checked = true;
						current_prop = null;
						return true;
					}
				} else if (o && o.hitTest(pt.x, pt.y)) {
					current_item = item;
					changeCurrentItemType(type);
					document.getElementById(type).checked = true;
					return true;
				}
			});
		}); 
		
		if (found_one) {
			hold_select = true;
			pt_select = {'x': Math.floor(event.stageX/config.pixel.w), 'y': Math.floor(event.stageY/config.pixel.h)}
		} else if (!found_one && current_type) {
			param = { 
				x: Math.floor(event.stageX/config.pixel.w), 
				y: Math.floor(event.stageY/config.pixel.h), 
				w: 1, 
				h: 1, 
				couleur: {'base': current_color, 'nuance': current_nuance}
			};
			
			if (current_sprite) param.sprite = current_sprite;
			
			current_item = createItem(stage, current_type, param);
			current_prop = null;
			hold_create = true;
		}
		
		if (current_item) {
			createCadre(current_item.param.x, current_item.param.y, current_item.param.w, current_item.param.h);
			changeCurrentItem(current_type);
			// console.log(current_item);
		}
	} else {
		if (!current_item.param.proprietes) {
			current_item.param.proprietes = {};
		}
		
		// Si la propriété sélectionnée existe
		if (current_item.param.proprietes[current_prop]) {
			
		// Si la propriété sélectionnée n'existe pas
		} else {
			if (config.item.proprietes[current_type][current_prop].representation) {
				param = {
					'representation': {
						x1: current_item.param.x, 
						y1: current_item.param.y, 
						x2: Math.floor(event.stageX/config.pixel.w), 
						y2: Math.floor(event.stageY/config.pixel.h)
					}
				};
				
				current_item.param.proprietes[current_prop] = createItemProp(current_type, current_prop, param);
				addAjustmentVariables(current_type, current_prop);
				
				hold_create = true;
			} else {
				console.log('n\'existe pas et pas de representation.');
			}
		}
	}
	
	stage.update();
}

function handleMouseMove(event) {
	if (hold_create) {
		if (current_prop && current_item) {
				var extended_prop = {
					'representation': {
						x1: current_item.param.x, 
						y1: current_item.param.y, 
						x2: Math.floor(event.stageX/config.pixel.w), 
						y2: Math.floor(event.stageY/config.pixel.h)
					}
				};
				
				deleteItemProp(current_item, current_prop);
				current_item.param.proprietes[current_prop] = createItemProp(current_type, current_prop, extended_prop);
				addAjustmentVariables(current_type, current_prop);
		} else if ((current_item.param.x > Math.floor(event.stageX/config.pixel.w) || current_item.param.x + current_item.param.w-1 < Math.floor(event.stageX/config.pixel.w)) 
			|| (current_item.param.y > Math.floor(event.stageY/config.pixel.h) || current_item.param.y + current_item.param.h-1 < Math.floor(event.stageY/config.pixel.h))) {
			
			var extended_item = { 
				x: current_item.param.x < Math.floor(event.stageX/config.pixel.w) ? current_item.param.x : Math.floor(event.stageX/config.pixel.w), 
				y: current_item.param.y < Math.floor(event.stageY/config.pixel.h) ? current_item.param.y : Math.floor(event.stageY/config.pixel.h), 
				w: current_item.param.x > Math.floor(event.stageX/config.pixel.w) || current_item.param.x + current_item.param.w-1 < Math.floor(event.stageX/config.pixel.w) ? current_item.param.w+1 : current_item.param.w, 
				h: current_item.param.y > Math.floor(event.stageY/config.pixel.h) || current_item.param.y + current_item.param.h-1 < Math.floor(event.stageY/config.pixel.h) ? current_item.param.h+1 : current_item.param.h,
				couleur: {'base': current_color, 'nuance': current_nuance},
				sprite: current_sprite,
				proprietes: current_item.param.proprietes ? JSON.parse(JSON.stringify(current_item.param.proprietes)) : null
			};

			deleteItem(current_type, current_item);

			current_item = createItem(stage, current_type, extended_item);
			
			createCadre(current_item.param.x, current_item.param.y, current_item.param.w, current_item.param.h);
		}
				
		stage.update();
	} else if (hold_select) {
		if (pt_select.x != Math.floor(event.stageX/config.pixel.w) || pt_select.y != Math.floor(event.stageY/config.pixel.h)) {
			var diff = {x: Math.floor(event.stageX/config.pixel.w) - pt_select.x,y: Math.floor(event.stageY/config.pixel.h) - pt_select.y}
			
			current_item.param.x += diff.x;
			current_item.param.y += diff.y;
			
			current_item.obj.x += diff.x * config.pixel.w;
			current_item.obj.y += diff.y * config.pixel.h;
			
			if (current_item.param.proprietes) {
				for (p_name in current_item.param.proprietes) {
					if (current_item.param.proprietes[p_name].representation) {
						var new_param = current_item.param.proprietes[p_name].representation.param;
						var new_obj = current_item.param.proprietes[p_name].representation.obj;
						switch(p_name) {
							case 'mouvement':
								new_param.x1 += diff.x;
								new_param.y1 += diff.y;
								new_param.x2 += diff.x;
								new_param.y2 += diff.y;
								break;
							default:
								new_param.x += diff.x;
								new_param.y += diff.y;
								break;
						}
						new_obj.x += diff.x * config.pixel.w;
						new_obj.y += diff.y * config.pixel.h;
					}
				}
			}
			
			stage.update();
			
			pt_select.x = Math.floor(event.stageX/config.pixel.w);
			pt_select.y = Math.floor(event.stageY/config.pixel.h);
		}
	}
}

function handleMouseUp(event) {
	if (hold_create) {
		hold_create = false;
		if (!current_prop) items_edit[current_type].push(current_item);
	} else if (hold_select) {
		hold_select = false;
	}
}
// Fin
