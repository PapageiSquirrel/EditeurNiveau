var socket = io.connect();

socket.on('message', function(msg) {
	console.log(msg);
});

socket.on('loc_autres', function(data) {
	if (mode == "game" && autres) {
		var autre;
		var found = autres.some(function(a) { 
			if (a.id === data.id) {
				autre = a;
				return true;
			}
			
		});

		if (found) {
			autre.move(data.location.x, data.location.y);
		} else {
			autres.push(new Autre(data.id, data.location.x, data.location.y));
		}
	}
});

socket.on('disconnect', function(data) {
	if (mode == "game") autres.splice(autres.indexOf(data.id), 1);
});

function sendData(nom, json) {
	try {
		json.ecrans.forEach(function(e) {
			e.layers = undefined;
		});
		socket.emit('json_data', { 'nom': nom, 'json': json });
	} catch (e) {
		console.log(e);
		console.log(json);
	}

}

function getListFiles(path, callback) {
	try {
		socket.emit('get_files', { 'path': path }, callback);
	} catch (e) {
		console.log(e);
	}
}

function getListFilesInSubdir(path, callback) {
	try {
		socket.emit('get_dirs', { 'path': path }, callback);
	} catch (e) {
		console.log(e);
	}
}

function sendDataToOthers(pos) {
	try {
		socket.emit('heros_data', {'location': pos});
	} catch (e) {
		console.log(e);
	}
}