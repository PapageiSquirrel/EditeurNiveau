function Menu() {
	this.isOpen = false;
	this.mode;
	this.menu_container = new createjs.Container();
	this.alpha_mask;
}

Menu.prototype.close = function() {
	this.isOpen = false;
	this.clear();
}

Menu.prototype.clear = function() {
	ui.clear();
	this.menu_container.removeAllChildren();
	stage.removeChild(this.menu_container);
	stage.removeChild(this.alpha_mask);
}

Menu.prototype.open = function(mode) {
	this.isOpen = true;
	this.mode = mode;
	
	if (mode == menuMode.Start) {
		var t = ui.writeTitle("ShapeShifter", 0.5 * config.taille.w * config.pixel.w, 0.2 * config.taille.h * config.pixel.h);
		var c1 = ui.write("Nouvelle Partie", 0.5 * config.taille.w * config.pixel.w, 0.4 * config.taille.h * config.pixel.h);
		var c2 = ui.write("Options", 0.5 * config.taille.w * config.pixel.w, 0.4 * config.taille.h * config.pixel.h);
		this.menu_container.addChild(t);
		this.menu_container.addChild(c1);
		this.menu_container.addChild(c2);

		playMusic(selected_format);
	} else {
		if (started) {
			var g = new createjs.Graphics()
				.beginFill("rgba(255,255,255,0.5)")
				.drawRect(ecran.position.x * config.taille.w * config.pixel.w, ecran.position.y * config.taille.h * config.pixel.h, config.taille.w * config.pixel.w, config.taille.h * config.pixel.h);
			this.alpha_mask = new createjs.Shape(g);
			stage.addChild(this.alpha_mask);
		}
		
		if (mode == menuMode.Jeu) {
			var menu_x = (ecran.position.x+0.5) * config.taille.w * config.pixel.w;
			var menu_y = (ecran.position.y+0.3) * config.taille.h * config.pixel.h;
			var c1 = ui.write("Options", menu_x, menu_y);
			var c2 = ui.write("Retour au jeu", menu_x, menu_y);
			var c3 = ui.write("Menu principal", menu_x, menu_y);
			this.menu_container.addChild(c1);
			this.menu_container.addChild(c2);
			this.menu_container.addChild(c3);
		} else if (mode == menuMode.Options) {
			var title_x = 0.5 * config.taille.w * config.pixel.w;
			var title_y = 0.2 * config.taille.h * config.pixel.h;
			var menu_x = 0.5 * config.taille.w * config.pixel.w;
			var menu_y = 0.4 * config.taille.h * config.pixel.h;
			if (started) {
				title_x = (ecran.position.x+0.5) * config.taille.w * config.pixel.w;
				title_y = (ecran.position.y+0.2) * config.taille.h * config.pixel.h;
				menu_x = (ecran.position.x+0.5) * config.taille.w * config.pixel.w;
				menu_y = (ecran.position.y+0.4) * config.taille.h * config.pixel.h;
			}
			var t = ui.writeTitle("Options", title_x, title_y);
			var c1 = ui.write("Musique", menu_x, menu_y);
			var c2 = ui.write("Resolution", menu_x, menu_y);
			var c3 = ui.write("Retour", menu_x, menu_y);
			this.menu_container.addChild(t);
			this.menu_container.addChild(c1);
			this.menu_container.addChild(c2);
			this.menu_container.addChild(c3);
		} else if (mode == menuMode.GameOver) {
			var title_x = (ecran.position.x+0.5) * config.taille.w * config.pixel.w;
			var title_y = (ecran.position.y+0.2) * config.taille.h * config.pixel.h;
			var menu_x = (ecran.position.x+0.5) * config.taille.w * config.pixel.w;
			var menu_y = (ecran.position.y+0.4) * config.taille.h * config.pixel.h;
			var t = ui.writeTitle("Fin", title_x, title_y);
			var c1 = ui.write("Menu principal", menu_x, menu_y);
			this.menu_container.addChild(t);
			this.menu_container.addChild(c1);
		}
	}
	ui.initSelect();
	stage.addChild(this.menu_container);
	stage.update();
}

Menu.prototype.startNewGame = function() {
	this.close();
	started = true;	
	
	loadWorld(config.depart.monde);
}

Menu.prototype.selectMenu = function() {
	switch(this.mode) {
		case menuMode.Start:
			if (ui.h_selected == 0) {
				this.startNewGame();
			} else if (ui.h_selected == 1) {
				this.clear()
				this.open(menuMode.Options);
			}
			break;
		case menuMode.Jeu:
			if (ui.h_selected == 0) {
				this.clear()
				this.open(menuMode.Options);
			} else if (ui.h_selected == 1) {
				this.close();
			} else if (ui.h_selected == 2) {
				this.clear()
				resetGame();
			}
			break;
		case menuMode.Options:
			if (ui.h_selected == 0) {
				this.clear()
				this.open(menuMode.Options);
			} else if (ui.h_selected == 1) {
				this.close();
			} else if (ui.h_selected == 2) {
				this.clear()
				if (started) this.open(menuMode.Jeu);
				else resetGame();
			}
			break;
		case menuMode.GameOver:
			if (ui.h_selected == 0) {
				this.clear();
				resetGame();
			}
			break;
	}
}