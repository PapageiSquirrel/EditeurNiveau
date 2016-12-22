var current_forme;

function shapeShift(heros, forme) {
	heros.graphics.clear();
	
	switch(forme) {
		case 'carre':
			heros.graphics.beginFill("red").drawRect(-10, -10, 20, 20);
			current_forme = 'carre';
			break;
		case 'rond':
			heros.graphics.beginFill("blue").drawCircle(0, 0, 10);
			current_forme = 'rond';
			break;
		case 'triangle':
			// TODO
			break;
	}
}

function nextShape(heros) {
	if (!current_forme) current_forme = 'rond';
	
	switch(current_forme) {
		case 'carre':
			shapeShift(heros, 'rond')
			break;
		case 'rond':
			shapeShift(heros, 'carre')
			break;
		case 'triangle':
			// TODO
			break;
	}
}