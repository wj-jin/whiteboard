var http = require('http');
var io = require('../3rdparty/socket.io-node/');
var sys = require('sys');


function start() {
	var clients = {};
	var commands = [];

	var server = http.createServer(function (request, response) {
		response.writeHead(500, {'Content-Type': 'text/html'});
		response.end('Error, not an HTTP server\n');
	});
	server.listen(9001);
	var socket = io.listen(server);

	socket.on('connection', function(client) {
		clients[client.sessionId] = client;
		
		for(i in commands) {
			client.send(commands[i]);
		}
		
		client.on('message', function(message) {
			if(message.client) {
				if(message.client == 'Canvas.wipe()') {
					commands = [];
				} else {
					commands.push(message.client);
				}

				socket.broadcast(message.client);
			}
		});
		
		client.on('disconnect', function() {
			clients[client.sessionId] = undefined;
		});
	});

	sys.puts('socket file server started at port 9001');
}

exports.start = start;
