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
	socket.emit('json_data', { 'nom': nom, 'json': json });
}

function getListFiles(path, callback) {
	socket.emit('get_files', { 'path': path }, callback);
}

function getListFilesInSubdir(path, callback) {
	socket.emit('get_dirs', { 'path': path }, callback);
}

function sendDataToOthers(pos) {
	socket.emit('heros_data', {'location': pos})
}