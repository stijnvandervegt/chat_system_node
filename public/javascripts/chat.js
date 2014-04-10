var Chat    = Chat || {};

(function(document, window) {
    Chat.controller = {
        server: "http://localhost:3000",
        socket: {},
        init: function() {
            this.socket = io.connect(this.server);
            Chat.inputs.init();
            Chat.handlers.init();
        }
    };

    Chat.inputs = {
      init: function() {

        this.sendMessage();
        this.writeMessage();

      },
      sendMessage: function() {
        $('#send').on('click', function() {

            var text            = document.getElementById('newMessage');
            var user_id         = $('#user_id');
            var user_connect_id = $('#user_connect_id');
            var username        = $('#username');

            var message = {
                message: text.value,
                user_id: user_id.attr('value'),
                user_connect_id: user_connect_id.attr('value'),
                username: username.attr('value')
            };
            Chat.handlers.showMessage(message, 'out');

            Chat.controller.socket.emit('user_write', {user_id: user_id.attr('value'), user_connect_id: user_connect_id.attr('value') }, false);
            Chat.controller.socket.emit('message', message);
            text.value = '';

        });
      },
      writeMessage: function() {
          $('#newMessage').on('keydown', function() {

              var user_id         = $('#user_id');
              var user_connect_id = $('#user_connect_id');

              if(this.value != '') {
                  Chat.controller.socket.emit('user_write', {user_id: user_id.attr('value'), user_connect_id: user_connect_id.attr('value') }, true);
              } else {
                  Chat.controller.socket.emit('user_write', {user_id: user_id.attr('value'), user_connect_id: user_connect_id.attr('value') }, false);
              }
          });
      }

    };

    Chat.handlers = {
        init: function() {
            Chat.controller.socket.on('message', this.showMessage);
            Chat.controller.socket.on('user_write', this.showWritingMessage);

            var user_id         = $('#user_id');
            var user_connect_id = $('#user_connect_id');

            this.registerUsername({user_id: user_id.attr('value'), user_connect_id: user_connect_id.attr('value') });
        },
        showMessage: function(msg, classname) {
            var message_box     = $('#messages');
            var spanname        = '<span class="name">'+ msg.username + ': </span>';
            var spantext        = '<span class="message">'+ msg.message + '</span>';
            var message_in      = '<div class="'+classname+'">'+spanname+spantext+'</div>';
            var message_div     = '<div class="clearfix">'+message_in+'</div>';

            message_box.append(message_div);

        },
        showWritingMessage: function(show) {
            if(show == true) {
                var message_box = $('#messages');
                var span        = document.createElement('span');
                span.setAttribute('id', 'writing');
                var content = document.createTextNode('Writing message');
                span.appendChild(content);
                message_box.append(span);
            } else {
                this.deleteWritingMessage();
            }
        },
        deleteWritingMessage: function() {
            var writing = document.getElementById('writing');

            if(writing) {
                writing.remove();
            }
        },
        registerUsername: function(user_id) {
            Chat.controller.socket.emit('user_join', user_id);
        }
    };


    window.onload = function() {
       Chat.controller.init();
    }

})(document, window);

