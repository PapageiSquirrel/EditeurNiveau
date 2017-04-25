// GLOBALES
var keyState, fpsLabel;
// SPRITES
var moteur, heros, monde, ecran, items_game;
// ETATS
var started, jump, collision, shift, wait_jump;
// FRAMES
var frames, jump_frame, jump_nb_frames, wait_jump_frame, wait_jump_nb_frames, shift_frame, shift_nb_frames;
// MULTI
var autres;

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
	
	autres = [];
	
	/*
	switching = { 'bas': false, 'haut': false, 'gauche': false, 'droite': false };
	switch_frame = 0;
	*/
	
	//pts_coll_heros = { 'bas': {'x': 0, 'y': 10}, 'haut': {'x': 0, 'y': -10}, 'gauche': {'x': -10, 'y': 0}, 'droite': {'x': 10, 'y': 0}};
	collision = { 'bas': false, 'haut': false, 'gauche': false, 'droite': false };
	items_game = {};

	heros = new Heros();
	moteur = new MoteurPhysique(stage, heros);
	// FIN INIT

	loadWorld(config.depart.monde);
}

function initGameHandler() {
	var depart_stage = { 
		'x': ecran.position.x * config.taille.w * config.pixel.w, 
		'y': ecran.position.y * config.taille.h * config.pixel.h
	}

	moteur.start(depart_stage.x, depart_stage.y);
	heros.start(depart_stage.x + config.depart.pt.x, depart_stage.y + config.depart.pt.y);
	
	moteur.initTriggers();
	moteur.initItemsLinks();
	started = true;	
	
	fpsLabel = new createjs.Text("-- fps", "bold 18px Arial", "#FFF");
	stage.addChild(fpsLabel);
	fpsLabel.x = depart_stage.x;
	fpsLabel.y = depart_stage.y;
	
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
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
	fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
	// Mort du héros
	if (heros.isRespawning()) {
		moteur.animateDeath();
	// Changement d'écran du héros
	} else if (heros.isSwitching()) {
		moteur.animateSwitch();
	// Cas normal (jeu)
	} else {
		moteur.execItemsProperties();
		
		// gravité (hors spécial)
		if (heros.canMove() && heros.isFalling()) {
			heros.move('bas', event.delta);
		}
		
		// Si espace alors activation (loot/item)
		if (keyState[32]) {
			heros.activate();
		}
		
		// Gestion des déplacements via l'inertie du héros
		if (heros.canMove()) {
			if (keyState[37] || keyState[65]) {
				if (heros.inertie > -1 * config.limites.inertie) heros.inertie -= 0.5; 
			} else {
				if (heros.inertie < 0) heros.inertie += 0.5; 
			}
			if (keyState[39] || keyState[68]) {
				if (heros.inertie < config.limites.inertie) heros.inertie += 0.5;
			} else {
				if (heros.inertie > 0) heros.inertie -= 0.5; 
			}
			heros.move('gauche', event.delta);
			heros.move('droite', event.delta);
		}
		
		// Gestion du saut
		if (!heros.isFalling() && !moteur.waitJump() && keyState[38]) {
			moteur.initJump();
			heros.nuancier_saut = 0;
		}
		if (heros.canMove() && heros.isJumping()) {
			if (keyState[38]) heros.nuancier_saut++;
			
			moteur.animateJump();
			heros.move('haut', event.delta);
		}
		
		// Gestion du changement de forme
		if (keyState[16] && heros.canShift()) {
			moteur.initShift();
		}
		if (heros.isShifting()) {
			moteur.animateShift();
		}
		
		// Gestion du spécial
		if (keyState[40] && heros.canSpecial()) {
			heros.hold_special = 0;
			moteur.initSpecial();
		}
		if (heros.isUsingSpecial()) {
			if (!keyState[40]) heros.hold_special = null;
			if (heros.hold_special != null) { 
				if (keyState[37]) heros.hold_special = -1;
				if (keyState[39]) heros.hold_special = 1;
				if (keyState[37] && keyState[39] || !keyState[37] && !keyState[39]) heros.hold_special = 0;
			}
			moteur.animateSpecial(event.delta);
		}
		
		// Gestion de l'inactivité
		if (!heros.isMoving()) {
			heros.shapeAnimation('wait');
		}
	}
	
	// Gestion mécanique du changement d'écran
	if (!heros.isSwitching() && heros.isOutOfBounds()) {
		var exists = monde.ecrans.some(function(obj_e) {
			var e = new Ecran(0, obj_e.nom, obj_e.position.x, obj_e.position.y, obj_e.plateformes, obj_e.decors, obj_e.loots, obj_e.ennemis);
			if (ecran.isAdjacentTo(e) == heros.getSwitchDir()) {
				ecran = e;
				moteur.initSwitch();
				moteur.initTriggers();
				return true;
			}
		});
		
		if (!exists) heros.setSwitchDir(undefined);
	}
	
	// TEST MULTI
	// sendDataToOthers({ x: heros.shape.x, y: heros.shape.y });

	frames++;
	// Ajustement de la position du héros pour éviter supperposition
	heros.adjustPosition('gauche');
	heros.adjustPosition('droite');
	heros.adjustPosition('bas');
	stage.update(event);
}