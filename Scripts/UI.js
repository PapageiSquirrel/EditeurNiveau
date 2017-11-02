function UI() {
	
}

UI.prototype.write = function(text) {
	var counter = 0;
	var c = new createjs.Container();
	c.width = 0;
	c.height = 50;
	
	for (var i = 0 ; i < text.length ; i++) {
		var code = text.charCodeAt(i);
		
		// TODO : identifier s'il s'agit d'une ponctuation d'une lettre ou d'un chiffre
		if (code >= 97) code -= 97;
		else if (code >= 65) code -= 65;
		else if (code == 32) c.width += 50;
		
		if (code <= 26) {
			c.width += 50;
			var alpha = new createjs.Bitmap(preload.getResult("Alphabet.png"));
			var y = Math.floor(code/13);
			var x = code - y*13;
			
			alpha.sourceRect = new createjs.Rectangle(x *100, y *100, 100, 100);
			alpha.scaleX = 0.5;
			alpha.scaleY = 0.5;
			
			alpha.x = counter * 50;
			
			c.addChild(alpha);
		}
		counter++;
	}
	
	return c;
}