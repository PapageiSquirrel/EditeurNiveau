// GLOBALES
var keyState;
// SPRITES
var moteur, heros, monde, ecran, items_game_game;
// ETATS
var started, jump, collision, shift, wait_jump;
// FRAMES
var frames, jump_frame, jump_nb_frames, wait_jump_frame, wait_jump_nb_frames, shift_frame, shift_nb_frames;

function initGame() {
	// INIT VARIABLES
	keyState = {};
	frames = 0;
	started = false;

	jump = false;
	jump_frame = 0;
	
	wait_jump = false
	wait_jump_frame = 0;
	
	shift = false;
	shift_frame = 0;
	
	/*
	switching = { 'bas': false, 'haut': false, 'gauche': false, 'droite': false };
	switch_frame = 0;
	*/
	
	//pts_coll_heros = { 'bas': {'x': 0, 'y': 10}, 'haut': {'x': 0, 'y': -10}, 'gauche': {'x': -10, 'y': 0}, 'droite': {'x': 10, 'y': 0}};
	collision = { 'bas': false, 'haut': false, 'gauche': false, 'droite': false };
	items_game = {};
	//heros = stage.addChild(new createjs.Shape());
	
	// TODO: définir dans monde le point de départ du héros
	heros = new Heros(config.depart.pt.x, config.depart.pt.y);
	
	moteur = new MoteurPhysique(stage, heros);
	// FIN INIT

	loadWorld(config.depart.monde);
}

function initGameHandler() {
	started = true;	
	
	ticker = createjs.Ticker.addEventListener("tick", handleTick);
	createjs.Ticker.setFPS(60);
	
	window.addEventListener('keydown',function(e){
		keyState[e.keyCode || e.which] = true;
	},true);    
	window.addEventListener('keyup',function(e){
		keyState[e.keyCode || e.which] = false;
	},true);
}

function handleTick(event) {
	if (heros.isSwitching()) {
		moteur.animateSwitch();
	} else {
		// TODO: mouvement des plateformes etc...
		items_game[ecran.nom]['plateforme'].forEach(function(item) {
			if (item.param.proprietes) {
				for (p_name in item.param.proprietes) {
					switch(p_name) {
						case 'mouvement':
							var param = item.param.proprietes[p_name]; // TODO: paramètres à ajouter à la propriété lors de l'édition
							if (!param.vitesse) {
								param.vitesse = 3;
								param.d = 1;
							}
							item.obj.y += param.vitesse * param.d;
							
							if (item.obj.y <= 0 || item.obj.y >= (param.representation.h - param.representation.y) * config.pixel.h) {
								param.d *= -1;
								console.log(item.obj);
							}
							break;
					}
				}
				
			}
		});
		
		// gravité
		heros.move('bas', event.delta);
		
		if (keyState[37] || keyState[65]) {
			heros.move('gauche', event.delta);
			//heros.x -= event.delta/1000 * 60 * config.vitesse.deplacement;
			//heros.rotation -= 5;
			// TODO: animation rotate en même temps que bouge
		}
		if (keyState[39] || keyState[68]) {
			heros.move('droite', event.delta);
			//heros.rotation += 5;
		}
		
		if (keyState[38] && heros.canJump()) {
			moteur.initJump();
		}
		if (heros.isJumping()) {
			moteur.animateJump();
			heros.move('haut', event.delta);
		}
		
		if (heros.canShift() && keyState[40]) {
			moteur.animateShift();
		}
	}

	if (!heros.isSwitching() && heros.isOutOfBounds()) {
		var exists = monde.ecrans.some(function(obj_e) {
			var e = new Ecran(obj_e.nom, obj_e.position.x, obj_e.position.y, obj_e.plateformes, obj_e.decors, obj_e.loots);
			
			if (ecran.isAdjacentTo(e) == heros.getSwitchDir()) {
				ecran = e;
				moteur.initSwitch();
				return true;
			}
		});
		
		if (!exists) heros.setSwitchDir(undefined);
	}

	frames++;
	stage.update(event);
}