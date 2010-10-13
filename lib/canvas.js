var sys = require('sys');

var canvas = function(name) {
	this.name = name;
	sys.puts('new canvas: ' + this.name);
};


function create(name) {
	return new canvas(name);
}	

exports.create = create;