function Autre(id, x, y, forme='rond') {
	this.id = id;
	
	this.shape = new createjs.Shape();
	this.shape.graphics.beginFill("blue").drawCircle(0, 0, 10);
	stage.addChild(this.shape);
	
	this.shape.x = x;
	this.shape.y = y;
}

Autre.prototype.move = function(x,y) {
	this.shape.x = x;
	this.shape.y = y;
}