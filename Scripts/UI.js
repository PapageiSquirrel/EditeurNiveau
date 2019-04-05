function UI(w_display, h_display) {
	this.w_display = w_display;
	this.h_display = h_display;

	this.title;
	this.containers = [];
	this.marge = 10;

	this.select_cadre;
	this.h_selected = 0;
	this.w_selected = 0;
}

UI.prototype.initSelect = function() {
	var defaut = this.containers[this.h_selected];
	var cadre_graph = new createjs.Graphics()
		.setStrokeStyle(1)
		.beginStroke("#000")
		.drawRect(-1*this.marge/2, -1*this.marge/2, defaut.width+this.marge*2, defaut.height+this.marge);

	this.select_cadre = new createjs.Shape(cadre_graph);
	defaut.addChild(this.select_cadre);
}

UI.prototype.clear = function() {
	this.h_selected = 0;
	this.title = null;
	//this.select_cadre = null;
	this.containers.splice(0, this.containers.length);
}

UI.prototype.writeTitle = function(text, title_x, title_y) {
	var counter = 0;
	var c = new createjs.Container();
	c.width = 0;
	c.height = this.h_display*2;
	
	for (var i = 0 ; i < text.length ; i++) {
		var code = text.charCodeAt(i);
		
		// TODO : identifier s'il s'agit d'une ponctuation d'une lettre ou d'un chiffre
		if (code >= 97) code -= 97;
		else if (code >= 65) code -= 65;
		else if (code == 32) c.width += this.w_display;
		
		if (code <= 26) {
			c.width += this.w_display;
			var alpha = new createjs.Bitmap(preload.getResult("Alphabet"));
			var y = Math.floor(code/13);
			var x = code - y*13;
			
			alpha.sourceRect = new createjs.Rectangle(x *100, y *100, 100, 100);
			alpha.x = counter * this.w_display*2;
			c.addChild(alpha);
		}
		counter++;
	}
	c.x = title_x - text.length/2 * this.w_display*2;
	c.y = title_y;
	this.title = c;
	return c;
}

UI.prototype.write = function(text, menu_x, menu_y) {
	var counter = 0;
	var c = new createjs.Container();
	c.width = 0;
	c.height = this.h_display;
	
	for (var i = 0 ; i < text.length ; i++) {
		var code = text.charCodeAt(i);
		
		// TODO : identifier s'il s'agit d'une ponctuation d'une lettre ou d'un chiffre
		if (code >= 97) code -= 97;
		else if (code >= 65) code -= 65;
		else if (code == 32) c.width += this.w_display;
		
		if (code <= 26) {
			c.width += this.w_display;
			var alpha = new createjs.Bitmap(preload.getResult("Alphabet"));
			var y = Math.floor(code/13);
			var x = code - y*13;
			
			alpha.sourceRect = new createjs.Rectangle(x *100, y *100, 100, 100);
			
			alpha.x = counter * this.w_display;
			alpha.scaleX = 0.5;
			alpha.scaleY = 0.5;

			c.addChild(alpha);
		}
		counter++;
	}
	c.x = menu_x - text.length/2 * this.w_display;
	c.y = menu_y + this.containers.length * this.h_display*1.5;
	this.containers.push(c);
	return c;
}

UI.prototype.selectNextOption = function() {
	this.containers[this.h_selected].removeChild(this.select_cadre);

	if (this.h_selected < this.containers.length-1) this.h_selected++;
	else this.h_selected = 0;

	this.containers[this.h_selected].addChild(this.select_cadre);
	this.selectOption(this.h_selected);
}

UI.prototype.selectPreviousOption = function() {
	this.containers[this.h_selected].removeChild(this.select_cadre);

	if (this.h_selected > 0) this.h_selected--;
	else this.h_selected = this.containers.length-1;

	this.containers[this.h_selected].addChild(this.select_cadre);
	this.selectOption(this.h_selected);
}

UI.prototype.selectOption = function(index) {
	this.select_cadre.graphics.clear();
	var c = this.containers[index];

	this.select_cadre.graphics.setStrokeStyle(1)
		.beginStroke("#000")
		.drawRect(-1*this.marge/2, -1*this.marge/2, c.width+this.marge*2, c.height+this.marge);
}