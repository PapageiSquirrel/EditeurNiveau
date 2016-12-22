var socket = io.connect();

socket.on('message', function(msg) {
	console.log(msg);
});

function sendData(nom, json) {
	socket.emit('json_data', { 'nom': nom, 'json': json });
}

function getListFiles(path, callback) {
	socket.emit('get_files', { 'path': path }, callback);
}
