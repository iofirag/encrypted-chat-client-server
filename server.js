var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var onlineUsersMap = new Object(); // or var map = {};

app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
	//console.log('a user connected');

	socket.on('user connected', function(user){
		console.log('user connected: '+user.nickname);
		onlineUsersMap[socket.id] = user;
		socket.broadcast.emit('user connected', user.nickname);
		io.emit('online users', onlineUsersMap);
	});

	socket.on('user typing', function(nickname){
		console.log('user typing: '+nickname);
		socket.broadcast.emit('user typing', nickname);
	});

	socket.on('user end typing', function(nickname){
		console.log('user end typing: '+nickname);
		socket.broadcast.emit('user end typing', '');
	});

	socket.on('chat message', function(msgObj){
		console.log('message: [' + msgObj.nickname + '] - '+msgObj.message);
		//io.emit('chat message', msg);
		socket.broadcast.emit('chat message', msgObj);
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		socket.broadcast.emit('user disconnected', onlineUsersMap[socket.id].nickname);
		delete onlineUsersMap[socket.id];
		io.emit('online users', onlineUsersMap);
	});
});

http.listen(app.get('port'), function(){
	console.log('listening on: '+app.get('port'));
});

// Everyone
//io.emit('chat message', msg);

// Everyone exccept me
//socket.broadcast.emit('chat message', msg);