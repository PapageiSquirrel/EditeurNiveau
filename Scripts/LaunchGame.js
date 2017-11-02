// GLOBALES
var keyState, fpsLabel, current_music, selected_format;
// SPRITES
var moteur, menu, heros, monde, ecran, items_game;
// ETATS
var started, collision;
// FRAMES
var frames;
// MULTI
var autres;

function initGame() {
	// INIT VARIABLES
	keyState = {};
	frames = 0;
	started = false;
	current_music = 'TS2';
	selected_format = 'ogg';
	
	autres = [];

	collision = {};
	for (dir in direction) {
		collision[direction[dir]] = false;
	}
	
	items_game = {};

	menu = new Menu();
	heros = new Heros();
	moteur = new MoteurPhysique(stage, heros);
	// FIN INIT

	menu.open(menuMode.Start);
	ui = new UI();
	menu.startNewGame();
	// playMusic(selected_format);
	
	// loadWorld(config.depart.monde);
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
	
	// Menu ouvert
	if (menu.isOpen) {
		if (keyState[13]) {
			menu.close();
		}
	// Mort du héros	
	} else if (heros.isRespawning()) {
		moteur.animateDeath();
	// Changement d'écran du héros
	} else if (heros.isSwitching()) {
		moteur.animateSwitch();
	// Cas normal (jeu)
	} else {
		moteur.execItemsProperties();
		
		// gravité (hors spécial)
		if (heros.canMove()) {
			heros.move(direction.Bas, event.delta);
		}
		
		// Gestion de l'accélération de la chute
		if (heros.isFalling()) {
			heros.fallAcceleration += 0.05;
			moteur.activate('wait_jump');
		} else {
			heros.fallAcceleration = 0;
		}
		
		// Si espace alors activation (loot/item/sauvegarde/...)
		if (keyState[32]) {
			heros.activate();
		}
		
		// Gestion des déplacements via l'inertie du héros
		if (heros.canMove()) {
			if (keyState[37] || keyState[65]) {
				if (heros.inertie > -1 * config.limites.inertie) heros.inertie -= 1; 
			} else {
				if (heros.inertie < 0) heros.inertie += 0.5;
			}
			if (keyState[39] || keyState[68]) {
				if (heros.inertie < config.limites.inertie) heros.inertie += 1;
			} else {
				if (heros.inertie > 0) heros.inertie -= 0.5;
			}
			
			if (heros.inertie < 0) {
				heros.move(direction.Gauche, event.delta);
			} else if (heros.inertie > 0) {
				heros.move(direction.Droite, event.delta);
			}
		}
		
		// Gestion du spécial
		if (keyState[40] && heros.canSpecial()) {
			heros.hold_special = 0;
			moteur.activate('special');
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
		
		// Gestion du saut
		if (!heros.isFalling() && !moteur.waitJump() && keyState[38]) {
			moteur.activate('jump');
			heros.nuancier_saut = 0;
		}
		if (heros.canMove() && heros.isJumping()) {
			if (keyState[38]) heros.nuancier_saut++;
			
			moteur.animateJump();
			heros.move(direction.Haut, event.delta);
		}
		
		// Gestion du changement de forme
		if (keyState[16] && heros.canShift()) {
			moteur.activate('shift');
		}
		if (heros.isShifting()) {
			moteur.animateShift();
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
				moteur.activate('switch');
				moteur.initTriggers();
				return true;
			}
		});
		
		if (!exists) heros.setSwitchDir(undefined);
	}
	
	// MENUING
	// Annuler Musique
	if (keyState[8]) {
		stopMusic();
	}
	if (keyState[27] && !menu.isOpen) {
		menu.open(menuMode.jeu);
	}
	
	// TEST MULTI
	// sendDataToOthers({ x: heros.shape.x, y: heros.shape.y });

	frames++;
	// Ajustement de la position du héros pour éviter supperposition
	/*
	heros.adjustPosition(direction.Gauche);
	heros.adjustPosition(direction.Droite);
	heros.adjustPosition(direction.Bas);
	*/
	stage.update(event);
}