
/**
 * Module dependencies.
 */

var express         = require('express');
var http            = require('http');
var path            = require('path');
var Provider        = require('./provider.js').Provider;

var app = express();

// all environments config express
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser('Authentication Tutorial '));
    app.use(express.session());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));

});

// development only
app.configure('development', function(){
    app.use(express.errorHandler());
});

// session start and delete
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

//Models
Provider.config.init('chat_system', 'localhost', 27017);

//Sockets
var Socket = require('./socket.js').Socket;
Socket.controller.init(app);

Socket.handlers.activateUserClient();
//Socket.handlers.activerUser();
Socket.handlers.setEmit('message', function(message) {

    var now             = new Date();
    var jsonDate        = now.toJSON();
    message.created_at  = jsonDate;

    Provider.query.save('messages', message, function( error, docs) {

    });

    var user = message.user_connect_id+'-'+message.user_id;

    if(Socket.controller.users[user]) {

        Socket.controller.users[user].emit('message', message, 'in');
    }
});

Socket.handlers.setEmit('user_write', function(user, show) {
    var user = user.user_connect_id+'-'+user.user_id;

    if(show == true) {
        if(Socket.controller.users[user]) {
            if(Socket.controller.writing[user]) {

            } else {
                Socket.controller.users[user].emit('user_write', true);
                Socket.controller.writing[user] = true;
            }
        }
    } else {
        if(Socket.controller.users[user]) {
            Socket.controller.users[user].emit('user_write', false);
            Socket.controller.writing[user] = false;
        }
    }
});

//Routes
app.get('/', function(req, res) {

    // check if the user's credentials are saved in a cookie
   if (req) {
       res.render('login',

           { title: 'Hello - Please Login To Your Account' }

       );
   } else {
       res.render('login',

           { title: 'Username or password are not correct, please try again' }

       );
   }
});

//login
app.post('/', function(req, res){

    var search_object = {
        name:       req.param('name'),
        password:   req.param('password')
    };
    var settings = {
        sort: '',
        limit: 1
    };
    Provider.query.get('users', search_object, settings, function( error, docs) {
        if(error) {
            return false;
        }
        req.session.user = docs[0];
        if(docs[0]) {
            if(docs[0].name) {
                res.redirect('/list');
            }
        } else {
            res.render('login',
                { title: 'Username or password are not correct, please try again' }
            );
        }
    });
});

// user list
app.get('/list', function (req, res) {

    if (req.session.user) {
        Provider.query.get('users', {}, {}, function(error, users) {

            res.render('index', {
                title: 'Users',
                users: users
            });
        });
    } else {
        res.render('login',

            { title: 'Hello - Please Login To Your Account' }

        );
    }
});

// chat
app.get('/message/:id', function (req, res) {

    var search_object = {
        user_id: {$in: [req.session.user._id, req.params['id']]} ,
        user_connect_id: {$in: [req.session.user._id, req.params['id']]}
    };

    var settings = {
        sort: '1',
        limit: 10
    };

    Provider.query.get('messages', search_object, settings, function(error, messages) {

        //sort message in correct direction
        messages.sort(function(a,b) {
            var dateA = new Date(a.created_at);
            var dateB = new Date(b.created_at);
            return dateA-dateB;
        });

        var search_object = {
            id: req.params['id']
        };

        Provider.query.getById('users', search_object, function(error, docs) {
            if(error) {

                return false;
            }

            res.render('chat', {
                title: 'Message to '+ docs[0].name,
                messages: messages,
                user_id: req.session.user._id,
                user_connect_id: req.params['id'],
                username: req.session.user.name
            });
        });
    });
});

//create new user
app.get('/user/new', function(req, res) {
    res.render('user_new', {
        title: 'New User'
    });
});

//save new user
app.post('/user/new', function(req, res){
    var save_object = {
        name: req.param('name'),
        email: req.param('email'),
        password: req.param('password')
    };

    Provider.query.save('users', save_object, function( error, docs) {
        res.redirect('/')
    });
});

