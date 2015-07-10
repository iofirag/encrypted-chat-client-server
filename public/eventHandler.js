var socket;
var cryptAlg;



// Encryption Handler
$('#encryptionType').change(function() {
  console.log(this.value);

  // first empty fields
  var encryptionElements = $('#encryptionElements');
  encryptionElements.empty();

  // build fields
  switch ( this.value.toLowerCase() ){
    case '':
      cryptAlg = null;
      break
    case 'rc4':  
      var vectorLength = $('<lable class="encryptionLable">Vector Length:</lable> <input id="vectorLength" value="4">');
      var key = $('<lable class="encryptionLable">Key (256 Byte):</lable> <input id="key">'+
                      '<input class="keyBt" type="button" value="Gen" id="rc4GenBtn">');
      var firstBytesDrop = $('<lable class="encryptionLable">First byte to drop:</lable> <input id="firstBytesDrop" value="100">');
      encryptionElements.append(vectorLength);
      encryptionElements.append(key);
      encryptionElements.append(firstBytesDrop);
      
      cryptAlg = new RC4();
      $('#rc4GenBtn').click(function(){
          $('#key').val(GenerateKey(10));
      });
          
      break;
    case '3des':
      var key1 = $('<lable class="encryptionLable">Key 1 (7 Byte):</lable> <input id="key1" class="encryptionElement" value="aaaaaaaaa"> \
                      <input class="keyBt" type="button" id="3desBtn1" value="Generate key">');
      var key2 = $('<lable class="encryptionLable">Key 2  (7 Byte):</lable> <input id="key2" class="encryptionElement" value="bbbbbbbbb"> \
                      <input class="keyBt" type="button" id="3desBtn2" value="Generate key">');
      var key3 = $('<lable class="encryptionLable">Key 3 (7 Byte):</lable> <input id="key3" class="encryptionElement" value="ccccccccc"> \
                      <input class="keyBt" type="button" id="3desBtn3" value="Generate key">');
      var opType = $('<lable class="encryptionLable">Oparation Type:</lable> <select id="opType" class="encryptionElement"> \
                      <option value="CBC">CBC</option> \
                      <option value="CFB">CFB</option> \
                      <option value="CTR">CTR</option> \
                    </select>');
      encryptionElements.append(key1);
      encryptionElements.append(key2);
      encryptionElements.append(key3);
      encryptionElements.append(opType);

      cryptAlg = new DES3();
      $('#3desBtn1').click(function(){
          $('#key1').val(GenerateKey(9));
      });
      $('#3desBtn2').click(function(){
          $('#key2').val(GenerateKey(9));
      });
      $('#3desBtn3').click(function(){
          $('#key3').val(GenerateKey(9));
      });
      break;
  }
});



// Auto click on button wile pressing Enter
$('#nickname').keypress(function( event ) {
  if ( event.which == 13 ) {
    event.preventDefault();
    var nickname = $('#nickname').val();
    if (!!nickname) {
      $('#connect').click();
    }
  }
});
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
      // Reconnect
      connectAndChangeView('reconnect');
    }  
  }else{
    // Create object of socket
    connectAndChangeView('connect');
  }
});


function connectAndChangeView(connectType) {

  // Handle connect button & input nickname
  var user = {
    nickname : $('#nickname').val(),
    encryptionType : $('#encryptionType').val()
  };

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
  $('#m').keypress(function( event ) {
    if ( event.which == 13 ) {
      event.preventDefault();
      sendMsg();
    }
  });
  function sendMsg() {
    var myMsg = $('#m').val();
    if (!!myMsg){
      $('#messages').append($('<li>').text('me: '+myMsg));

      // If user using cryptographic alg.
      if (!!cryptAlg) socket.emit('chat message', cryptAlg.Crypt(myMsg));
      else socket.emit('chat message', myMsg);
      
      $('#m').val('');
    }
  };

  
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

    // If user using cryptographic alg.
    var decryptMsg;
    if (!!cryptAlg) decryptMsg = cryptAlg.Decrypt(msgObj.message);
    else decryptMsg = msgObj.message;

    $('#messages').append($('<li>').text(msgObj.nickname+': '+decryptMsg));
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