var canvas = require('./lib/canvas');
var postit = require('./lib/postit');
var static_server = require('./lib/static_server');
var socket_server = require('./lib/socket_server');

static_server.start();
socket_server.start();

