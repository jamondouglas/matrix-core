var zmq = require('zeromq');
var matrix_io = require('matrix-protos').matrix_io;
var matrix_ip = '192.168.1.98';
var matrix_everloop_base_port = 20021;
var matrix_device_leds = 0;


var errorSocket = zmq.socket('sub');
errorSocket.connect('tcp://' + matrix_ip +':'+ (matrix_everloop_base_port + 2));
errorSocket.subscribe('');

errorSocket.on('message', (error_message)=> {
	console.log('Error received: ' + error_message.toString('utf8'));
});

var updateSocket = zmq.socket('sub');
updateSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 3));

updateSocket.subscribe('');
updateSocket.on('message', (buffer) => {
	var data = matrix_io.malos.v1.io.EverloopImage.decode(buffer);
	matrix_device_leds = data.everloopLength;
});

var pingSocket = zmq.socket('push');
pingSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 1));
pingSocket.send('');

var configSocket = zmq.socket('push');
configSocket.connect('tcp://'+ matrix_ip + ':' + (matrix_everloop_base_port));

var image = matrix_io.malos.v1.io.EverloopImage.create();
setInterval(function(){
	for(var i = 0; i< matrix_device_leds; ++i){
		image.led[i] = {
			red: Math.floor(Math.random() * 255) +1,
			green: Math.floor(Math.random() * 255) +1,
			blue: Math.floor(Math.random() * 255) +1,
			white:0
		};
	}

	var config = matrix_io.malos.v1.driver.DriverConfig.create({
		'image' : image
	})

	if(matrix_device_leds > 0) {
		configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
	}
}, 500)