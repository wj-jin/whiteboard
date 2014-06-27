var sys = require('sys');  //import for js?

var canvas = function(name) {
	this.name = name;
	sys.puts('new canvas: ' + this.name);  //send to system new canvas: name
};


function create(name) {
	return new canvas(name); //create canvas?
}	

exports.create = create; //export the function?
