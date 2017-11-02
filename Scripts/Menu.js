function Menu() {
	this.isOpen = false;
}

Menu.prototype.close = function() {
	this.isOpen = false;
	
	ecran.layers['ui'].removeAllChildren();
}

Menu.prototype.open = function(mode) {
	this.isOpen = true;
	
	if (mode == menuMode.start) {
		var c = ui.write("Nouvelle Partie");
		c.x = 200 + ecran.position.x * config.taille.w * config.pixel.w;
		c.y = 150 + ecran.position.y * config.taille.h * config.pixel.h;
		
		console.log(c.x, c.y, fpsLabel.x, fpsLabel.y);
		console.log(c, fpsLabel);
		
		ecran.layers['ui'].addChild(c);
	} else if (mode == menuMode.jeu) {
		var c = ui.write("Menu 1");
		c.x = 200;
		c.y = 150;
		
		ecran.layers['ui'].addChild(c);
	}
}

Menu.prototype.startNewGame = function() {
	this.isOpen = false;
	started = true;	
	
	loadWorld(config.depart.monde);
	
	playMusic(selected_format);
}