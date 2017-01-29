var http = require('http');
var statics =require("./statics/index");
var host = "localhost";
var port = process.env.PORT || 8000;

// simple http server
var http_server = http.createServer(function (req, res) {

    // serve static files
    var isServerStatics = statics.serveStatics(req, res);
    if(isServerStatics){
        return;
    }

    setTimeout(function () {
        var num = Math.random();
        setTimeout(function () {

            res.end("User "+num);
        }, 1000);
    }, 1000);

}).listen(port, host);


// Start listening for the sockets
var io = require('socket.io')(http_server);
var connectedUsers = {};
var userCount = 0;
var userList = [];

// handle socket requests
io.on('connection', function(socket){

    connectedUsers[socket.id]=("user_" + userCount);
    userCount++;

    function refreshUserList(socket_id) {
        if(Object.keys(connectedUsers).length > 0){
            userList = [];
            for(var key in connectedUsers){
                if(connectedUsers.hasOwnProperty(key)){
                    userList.push(connectedUsers[key]);
                }
            }
        }
        io.emit('user list changed', {userList:userList, self: socket_id});
    }
    refreshUserList(socket.id);
    io.emit('user connected', {user: connectedUsers[socket.id], socket_id: socket.id});
    socket.on('disconnect', function(){
        var exist = connectedUsers.hasOwnProperty(socket.id);
        if (exist) {
            io.emit('user disconnected', {user: connectedUsers[socket.id], socket_id: socket.id});
            delete connectedUsers[socket.id];
        }

        refreshUserList();
    });
    socket.on('chat message', function(data){
        var user = connectedUsers[data.socket_id];
        data["user"] =user;
        io.emit('chat message', data);
    });

    socket.on('name changed', function(data){
        var user = connectedUsers[data.socket_id];
        data["user"] =user;
        connectedUsers[data.socket_id] =data.newName;
        io.emit('name changed', data);
        refreshUserList();
    });


});