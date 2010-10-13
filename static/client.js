(function() {
	var Command = new function() {
		var allowed = [
			/Canvas.free\(\)/,
			/Canvas.lock\(\)/,
			/Canvas.wipe\(\)/,
			/Canvas.draw\(\d+,\d+\)/,
			/Canvas.setPointer\(\d+,\d+\)/
		];

		function execute(data) {
			for(i in allowed) {
				var reg = allowed[i];
				var matches = reg.exec(data);
				
				if(matches) {
					eval(data);
				}
			}
			
		}
		this.execute = execute;
	}
	
	var Socket = new function() {
	    var socket = new io.Socket(window.location.hostname, {
			port: 9001,
			transports: ['xhr-multipart', 'xhr-polling']
		});
	
	    socket.on('connect', function() {
			console.log('connect');
			socket.send({server: 'Canvas.getCanvas()'});
		});
	
	    socket.on('message', function(data) {
			console.log('message:' + data);
			Command.execute(data);
		});
	
	    socket.on('disconnect', function() {
			console.log('disconnect');
		});
	
		socket.connect();
		
		this.send = function(data) {
			socket.send({client: data});
		}
	};
   
	var Canvas = new function() {
		var canvas = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		
		ctx.fillStyle = "black";

		var x;
		var y;
		
		this.locked = false;
		var drawing = false;

		canvas.onmousedown = function(e) {
			Socket.send('Canvas.lock()');

			x = e.clientX;
			y = e.clientY;
			drawing = true;

			ctx.beginPath();
			setPointer(x, y);
			Socket.send('Canvas.setPointer('+x+','+y+')');
		}

		canvas.onmouseup = function(e) {
			free();
			ctx.closePath();
			drawing = false;
			Socket.send('Canvas.free()');
		}

		canvas.onmousemove = function(e) {
			if (x == null || y == null) {
				return;
			}
			
			x = e.clientX;
			y = e.clientY;
			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;
			x += $(window).scrollLeft();
			y += $(window).scrollTop();
			
			if(drawing) {
				Socket.send('Canvas.draw('+x+','+y+')');
			}
		}
		
		function setPointer(x, y) {
			ctx.moveTo(x, y);
		}		
		this.setPointer = function(x, y) {
			if(!drawing) {
				setPointer(x, y);
			}
		};
		
		function draw(x, y) {
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.moveTo(x, y);
		}
		this.draw = draw;
		
		function lock() {
			this.locked = true;
		}
		this.lock = function() {
			if(!this.locked) {
				lock();
			}
		};

		function free() {
			this.locked = false;
			x = null;
			y = null;
		}
		this.free = function() {
			if(!this.locked) {
				free();
			}
		};
		
		function wipe() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		this.wipe = wipe;
		
		$('#clear').click(function() {
			Socket.send('Canvas.wipe()');
			return false;
		});
	};
})();