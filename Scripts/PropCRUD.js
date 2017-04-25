function createProp(st, prop, param) {
	var new_param = {};
	
	switch(prop) {
		case 'mouvement':
			new_param = param;
			break;
		case 'rotation':
			var v1 = { 'x': (-1 * current_item.param.w), 'y': 0 };
			var v2 = { 'x': param.x2 - (param.x1 + current_item.param.w), 'y': param.y2 - param.y1 };
			new_param.r = calculAngle(v1, v2);
			break;
		case 'traversable':
			new_param = { 'x': current_item.param.x, 'y': current_item.param.y, 'w': current_item.param.w, 'h': current_item.param.h };
			break;
		case 'defilement':
			new_param = { 'x': current_item.param.x, 'y': current_item.param.y, 'w': current_item.param.w, 'h': current_item.param.h };
			new_param.sens = Math.sign(param.x2-param.x1);
			break;
		case 'texte':
			new_param = { 'x': current_item.param.x, 'y': current_item.param.y, 'w': current_item.param.w, 'h': current_item.param.h };
			new_param.text = "(texte)";
			if (config.palette[couleur.base][couleur.nuance]) new_param.couleur = config.palette[couleur.base][couleur.nuance];
			else new_param.couleur = "#000000";
			break;
		case 'destructible':
			new_param = { 'x': current_item.param.x, 'y': current_item.param.y, 'w': current_item.param.w, 'h': current_item.param.h };
			break;
		case 'sauve':
			new_param = { 'x': current_item.param.x, 'y': current_item.param.y, 'w': current_item.param.w, 'h': current_item.param.h };
			new_param.text = "S";
			new_param.couleur = "#00C900";
			break;
	}
	
	return { 'obj': createGraphProp(st, prop, new_param), 'param': new_param };
}

function createGraphProp(st, prop, param) {
	switch(prop) {
		case 'mouvement':
			return createLine(st, param.x1, param.y1, param.x2, param.y2);
			break;
		case 'rotation':
			return createSemiCircle(st, current_item.param.x, current_item.param.y, current_item.param.w, current_item.param.h, param.r * Math.PI / 180);
			break;
		case 'traversable':
			return createCalque(st, param.x, param.y, param.w, param.h);
			break;
		case 'defilement':
			return createArrow(st, param.x, param.y, param.w, param.h, param.sens);
			break;
		case 'texte':
			return createText(st, param.x, param.y, param.w, param.h, param.couleur, param.text);
			break;
		case 'destructible':
			return createStrokes(st, param.x, param.y, param.w, param.h);
			break;
		case 'sauve':
			return createText(st, param.x, param.y, param.w, param.h, param.couleur, param.text);
			break;
	}
}

function createText(st, x, y, w, h, couleur, tx) {
	var obj_size = w * config.pixel.w < h * config.pixel.h ? w * config.pixel.w : h * config.pixel.h;
	var txt = new createjs.Text(tx, Math.floor(obj_size/3) + "px Arial", couleur); // Math.floor(obj_size*2)
	
	txt.scaleX = 2;
	txt.scaleY = 2;
	
	txt.x = x * config.pixel.w;
	txt.y = y * config.pixel.h;
	txt.align = "center";
	txt.maxWidth = Math.floor(obj_size);
	
	st.addChild(txt);
	return txt;
}

function createLine(st, x1, y1, x2, y2) {
	var line = new createjs.Shape();
	
	line.graphics.setStrokeStyle(2);
	line.graphics.beginStroke("#0000FF"); // bleu ?
	line.graphics.moveTo((x1+0.5) * config.pixel.w, (y1+0.5) * config.pixel.h);
	line.graphics.lineTo((x2+0.5) * config.pixel.w, (y2+0.5) * config.pixel.h);
	
	st.addChild(line);
	return line;
}

function createSemiCircle(st, x, y, w, h, r) {
	var sc = new createjs.Shape();

	sc.graphics.setStrokeStyle(2);
	sc.graphics.beginStroke("#FF0000");
	sc.graphics.arc((x+w-0.5) * config.pixel.w, (y+h-0.5) * config.pixel.h, (w-0.5) * config.pixel.w, Math.PI, Math.PI - r, true);
	
	st.addChild(sc);
	return sc;
}

function createCalque(st, x, y, w, h) {
	var rect = new createjs.Shape();
	
	rect.graphics.beginFill("#FFFFFF").drawRect(x * config.pixel.w, (y+0.5) * config.pixel.h, w * config.pixel.w, (h-0.5) * config.pixel.h);
	rect.alpha = 0.5;
	
	st.addChild(rect);
	return rect;
}

function createArrow(st, x, y, w, h, s) {
	var arrow = new createjs.Shape();
	var x_depart = {};
	if (s == 1) {
		x_depart = x+w;
	} else if (s == -1) {
		x_depart = x;
	}
	arrow.graphics.setStrokeStyle(2);
	arrow.graphics.beginStroke("#00C900");
	arrow.graphics.moveTo(x_depart * config.pixel.w, y * config.pixel.h);
	arrow.graphics.lineTo((x_depart+1) * config.pixel.w, y * config.pixel.h);
	arrow.graphics.lineTo((x_depart+2) * config.pixel.w, (y+h/2) * config.pixel.h);
	arrow.graphics.lineTo((x_depart+1) * config.pixel.w, (y+h) * config.pixel.h);
	arrow.graphics.lineTo(x_depart * config.pixel.w, (y+h) * config.pixel.h);
	
	st.addChild(arrow);
	return arrow;
}

function createStrokes(st, x, y, w, h) {
	var str = new createjs.Shape();
	
	str.graphics.setStrokeStyle(2);
	str.graphics.beginStroke("#000000");
	str.graphics.moveTo(x * config.pixel.w, y * config.pixel.h);
	str.graphics.lineTo((x+w) * config.pixel.w, (y+h) * config.pixel.h);
	str.graphics.moveTo(x * config.pixel.w, (y+h) * config.pixel.h);
	str.graphics.lineTo((x+w) * config.pixel.w, (y) * config.pixel.h);
	
	st.addChild(str);
	return str;
}

function calculAngle(u, v) {
	var cosinus, long_u, long_v, produit_scalaire;
	
	long_u = Math.sqrt(Math.pow(u.x,2) + Math.pow(u.y,2));
	long_v = Math.sqrt(Math.pow(v.x,2) + Math.pow(v.y,2));
	produit_scalaire = u.x * v.x + u.y * v.y;
	cosinus = produit_scalaire / (long_u * long_v);
	
	return Math.acos(cosinus) * 180 / Math.PI;
}