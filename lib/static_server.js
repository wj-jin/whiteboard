var sys = require('sys');
var http = require('http');
var fs = require('fs');


var CACHE_INTERVAL = 1000;

function start() {
	var routes = {
		'/' : { file: './static/index.html', header: 'text/html' },
		'/index.html' : { file:  './static/index.html', header: 'text/html' },
		'/shared.css' : { file:  './static/shared.css', header: 'text/css' },
		'/client.js' : { file:  './static/client.js', header: 'application/javascript' },
		'/socket.io.js' : { file:  './3rdparty/socket.io-node/support/socket.io-client/socket.io.js', header: 'application/javascript' },
		'/jquery.js' : { file:  './3rdparty/jquery-1.4.2.min.js', header: 'application/javascript' }
	};
	
	var filecache = {};

	function cacheFile(url) {
		if(routes[url]) {
			fs.readFile(routes[url].file, function(err, data) {
				if(!err ) {
					filecache[url] = {
						data: data.toString(),
						time: (new Date).getTime()
					};
				}
			});
		}
	}
	
	function getCachedFile(url) {
		if(routes[url] && filecache[url]) {
			return {
				data: filecache[url].data,
				header: routes[url].header
			}
		}
		
		return false;
	}
    
	function loadCache() {
		for(url in routes) {
			cacheFile(url);
		}

		setTimeout(refreshCache, (CACHE_INTERVAL * 2));
	}
	
	function refreshSingleFile(url) {
		fs.stat(routes[url].file, function(err, stats) {
			f = (new Date(stats.mtime)).getTime() - (CACHE_INTERVAL / 1000);
			c = filecache[url].time;
			
			if(c < f) {
				sys.puts('modified: ' + url);
				cacheFile(url);
			}
		});		
	}

	function refreshCache() {
		for(url in routes) {
			refreshSingleFile(url);
		}

		setTimeout(refreshCache, CACHE_INTERVAL);
	}

	function startServer() {
		var server = http.createServer(function (request, response) {
			sys.puts('static request: ' + request.url);

			if(routes[request.url]) {
				var route = getCachedFile(request.url);

				if(route) {
					response.writeHead(200, {'Content-Type': route.header});
					response.end(route.data);
				} else {
					response.writeHead(500, {'Content-Type': 'text/html'});
					response.end('server error: cached file not found');
				}
			} else {
				response.writeHead(400, {'Content-Type': 'text/html'});
				response.end('Not found\n');
			}

		})
		server.listen(9000);

		sys.puts('static file server started at port 9000');
	}
	
	loadCache();	
	setTimeout(startServer, 1000);
}

exports.start = start;
