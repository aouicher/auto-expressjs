
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
// all environments
app.set('port', process.env.PORT || 443);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/auto', routes.index);
app.get('/auto/users', user.list);


var rooms = [];

function room(roomSocket, roomId){
    this.roomSocket = roomSocket;
    this.roomId = roomId;
    this.mobileSockets = [];
};


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io = require('socket.io').listen(server,{ resource : '/auto/socket.io', origins: '*:*' });

io.sockets.on('connection', function (socket) {

    socket.on('room', function(data) {
        socket.join(data);
        console.log("socket ID  : "+socket.id);
        console.log("Room ID  : "+data);
    });


    socket.on('send', function (data) {

        io.sockets.in(data.room).emit('direction', data);
    });

    socket.on("connect mobile", function(data){
        io.sockets.in(data.room).emit('add user', data);
 });

});
