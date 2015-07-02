var socket;

$('#connect').click(function(){
  if (typeof socket!=='undefined' && socket!=null){ 
    if (socket.connected){
      // Disconnect
      console.log('disconnect');
      $('#connect').attr('disabled','disabled');
      socket.close();

      // Remove data
      $('#onlineUsers').empty();
      $('#messages').empty();

      // Change view
      $('#nickname').removeAttr('disabled');
      $('#nickname').css('color','black');
      $('#nickname').css('background-color','000000');
      $('#connect').removeAttr('disabled');
      $('#connect').text('Connect');

    }else if (!socket.connected){
      // Recnnect
      connectAndChangeView('reconnect');
    }  
  }else{
    // Create object of socket
    connectAndChangeView('connect');
  }
});


function connectAndChangeView(connectType) {

  // Handle connect button & input nickname
  var nickname = $('#nickname').val();

  var user = {
    nickname : nickname,
    encryption : 'rsa'
  }

  // Change view
  $('#nickname').attr('disabled','disabled');
  $('#nickname').css('color','gray');
  $('#nickname').css('background-color','#F0F0F0');
  $('#connect').attr('disabled','disabled');        
  
  switch(connectType){
    case 'connect': socket = io();
        socket.emit('user connected', user);
      break;
    case 'reconnect': socket.open();
        socket.emit('user connected', user);
      break;
  }

  /**
   * Send Events
   */
  // Send typing...
  $('#m').on('input', function(e){
    //console.log('user is typing');
    socket.emit('user typing', user.nickname);
  });
  // Send end typing
  $('#m').donetyping(function(){
    //console.log('Event last fired @ ' + (new Date().toUTCString()));
    socket.emit('user end typing', user.nickname);
  });
  // Send chat message
  $('form').submit(function(){
    var myMsg = $('#m').val();
    $('#messages').append($('<li>').text('me: '+myMsg));
    socket.emit('chat message', {nickname: user.nickname, message: myMsg});
    $('#m').val('');
    return false;
  });
  
  
  /**
   * Received Events
   */
  // user connected
  socket.on('user connected', function(nickname){
    $('#messages').append($('<li class="connectTitle">').text(nickname+' - connected.'));
  });
  // online users
  socket.on('online users', function(onlineUsersMap){
    $('#onlineUsers').empty();
    $.each(onlineUsersMap, function(i,user){
      $('#onlineUsers').append($('<li class="userId">').text(user.nickname));
    });
  });
  // typing
  socket.on('user typing', function(nickname){
    $('#typing').text(nickname+' is typing...');
  });
  // end typing
  socket.on('user end typing', function(){
    $('#typing').empty();
  });
  // chat message 
  socket.on('chat message', function(msgObj){
    $('#typing').empty();
    $('#messages').append($('<li>').text(msgObj.nickname+': '+msgObj.message));
  });
  // user disconnected 
  socket.on('user disconnected', function(userId){
    $('#messages').append($('<li class="disconnectTitle">').text(userId+' - has left the room.'));
  });

  $('#connect').text('Disconnect');
  $('#connect').removeAttr('disabled');
}




//
// $('#element').donetyping(callback[, timeout=1000])
// Fires callback when a user has finished typing. This is determined by the time elapsed
// since the last keystroke and timeout parameter or the blur event--whichever comes first.
//   @callback: function to be called when even triggers
//   @timeout:  (default=1000) timeout, in ms, to to wait before triggering event if not
//              caused by blur.
// Requires jQuery 1.7+
//
;(function($){
    $.fn.extend({
        donetyping: function(callback,timeout){
            timeout = timeout || 1e3; // 1 second default timeout
            var timeoutReference,
                doneTyping = function(el){
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function(i,el){
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress',function(e){
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too premptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type=='keyup' && e.keyCode!=8) return;
                    
                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function(){
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur',function(){
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });
})(jQuery);