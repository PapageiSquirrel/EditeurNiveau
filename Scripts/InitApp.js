var stage, preload, ui, sprites, musics, config;
var monde, ecran, items;

function init() {
	sprites = {};
	musics = {};
	ui = {};
	
	preload = new createjs.LoadQueue(false);
	preload.loadFile({id: "config", src: "config.json"});
	
	loadSpriteBank(function(manifest) {
		preload.loadManifest(manifest);
		
		if (ui != {} && musics != {}) preload.on("complete", handlePreload, this);
	});
	
	loadMusics(function(manifest) {
		preload.installPlugin(createjs.Sound);
		preload.loadManifest(manifest);
		
		if (ui != {} && sprites != {}) preload.on("complete", handlePreload, this);
	});
	
	loadUI(function(manifest) {
		preload.loadManifest(manifest);
		console.log(manifest);
		
		if (sprites != {} && musics != {}) preload.on("complete", handlePreload, this);
	});
}

function handlePreload() {
	if (!config) {
		config = preload.getResult("config");
	
		if (mode == 'edit') {
			definePixel(5/9);
			
			initEdit();
		} else if (mode == 'game') {
			definePixel(3/4);
			
			initGame();
		}
	}
}

function definePixel(prop) {
	var canvas = document.getElementById("ZoneJeu");
	stage = new createjs.Stage(canvas);
	
	if (window.innerWidth/4 < window.innerHeight/3) {
		var w = window.innerWidth * prop; // 3/4
		var h = window.innerWidth * prop * (3/4); // 3/4 * 3/4
	} else {
		var h = window.innerHeight * prop; // 3/4
		var w = window.innerHeight * prop * (4/3); // 3/4 * 4/3
	}

	canvas.width  = w;
	canvas.height = h;
	
	config.pixel = {'w': w / config.taille.w, 'h': h / config.taille.h };
}

function initStage() {
	if (mode == 'edit') {
		initEditHandler();
	} else if (mode == 'game') {
		initGameHandler();
	}
}

function clearCanvas() {
	if (mode == 'edit') {
		ecran = {};
		
		clearAdjacentCanvas();
		current_item = null;
		current_prop = null;
		cadre_sel.graphics.clear();
		
		config.item.type.forEach(function(type) {
			for(var i = items_edit[type].length-1 ; i >= 0 ; i--) {
				for (prop in items_edit[type][i].param.proprietes) {
					deleteItemProp(items_edit[type][i], prop);
				}
				deleteItem(type, items_edit[type][i]);
			}

			for(var i = items_all_edit[type].length-1; i >= 0 ; i--) {
				for (prop in items_all_edit[type][i].param.proprietes) {
					deleteItemProp(items_all_edit[type][i], prop);
				}
				deleteItem(type, items_all_edit[type][i]);
			}
		});
		
		stage.removeChild(grid);
		stage.update();
	}
}
