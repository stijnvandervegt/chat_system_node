var Socket = Socket || {};

Socket.controller = {
    users: {},
    writing: {},
    init: function(app) {
        this.io         = require('socket.io').listen(app.listen(3000));
    },
    getConnection: function(callback) {
        this.sockets = this.io.sockets.on('connection', function(client){
            callback(client);
        });
    }
};

Socket.handlers = {
    setEmit: function(emit, callback) {
        Socket.controller.getConnection(function(client) {
            client.on(emit, callback);
        });
    },
    activateUserClient: function() {
        Socket.controller.getConnection(function(client) {
            client.on('user_join', function(user) {
                client.user_id                            = user.user_id+'-'+user.user_connect_id;
                Socket.controller.users[client.user_id]   = client;
            });
        });
    },
    activateUser: function() {
        Socket.controller.getConnection(function(client) {
            client.on('user_activate', function(user) {
                Socket.controller.users[user.user_id]   = client;
            });
        });
    }
};

exports.Socket = Socket;
