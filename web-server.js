http = require("http"),
path = require("path"),
url = require("url"),
fs = require("fs");
io = require('socket.io');

function sendError(errCode, errString, response)
{
  response.writeHead(errCode, {"Content-Type": "text/plain"});
  response.write(errString + "\n");
  response.end();
  return;
}
 
function sendFile(err, file, response)
{
  if(err) return sendError(500, err, response);
  response.writeHead(200);
  response.write(file, "binary");
  response.end();
}
 
function getFile(exists, response, localpath)
{
  if(!exists) return sendError(404, '404 Not Found', response);
  fs.readFile(localpath, "binary",
	function(err, file){ sendFile(err, file, response);});
}
 
function getFilename(request, response)
{
  var urlpath = url.parse(request.url).pathname; // following domain or IP and port
  var localpath = path.join(process.cwd(), urlpath); // if we are at root
  console.log(localpath);
  fs.exists(localpath, function(result) { getFile(result, response, localpath)});
}

var server = http.createServer(getFilename);
server.listen(1000);
console.log("Serveur disponible : http://localhost:1000/ShapeShifter.html");

var listener = io.listen(server);

var client_sockets = [];
listener.sockets.on('connection', function(socket) {
	client_sockets.push(socket);
	
	socket.on('json_data', function(data) {
		// Write json into file		
		fs.writeFile('JSON/' + data.nom, JSON.stringify(data.json), function (err) {
			if (err) return console.log(err);
			socket.emit('message', 'data saved !');
		});
		// Then emit answer
	});
	
	socket.on('get_files', function(data, callback) {
		fs.readdir(data.path, function(err, files) {
			callback(files);
		});
	});
	
	socket.on('get_dirs', function(data, callback) {
		fs.readdir(data.path, function(err, dirs) {
			var files = {};
			if (dirs && dirs[0] )
			dirs.forEach(function(dir) {
				files[dir] = fs.readdirSync(path.join(data.path, dir));
			});
			callback(files);
		});
	});
	
	socket.on('heros_data', function(data) {
		if (client_sockets.length > 1) socket.broadcast.emit('loc_autres', {'id': client_sockets.indexOf(socket), 'location': data.location });
	});
	
	socket.on('disconnect', function() {
		var i = client_sockets.indexOf(socket);
		client_sockets.splice(i, 1);
		
		if (client_sockets.length > 1) {
			socket.broadcast.emit('disconnect', {'id': i});
		}
	});
});