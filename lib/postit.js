var sys = require('sys');

var postit = function(name) {
	this.name = name;
	sys.puts('new postit: ' + this.name);
};


function create(name) {
	return new postit(name);
}	

exports.create = create;