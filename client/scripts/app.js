$(document).ready(function() {
// http://parse.sfm8.hackreactor.com/chatterbox/classes/messages
  var App = function() {
    this.friends = [];
    this.server = 'http://127.0.0.1:3000/classes/messages';
    this.rooms = ['lobby'];
    this.messages = [];
    this.renderIndex = 0;
    this.room;
  };

  App.prototype.init = function() {

    // console.log("Initializing App...");
    var app = this;
    this.fetch();
    console.log("OUTSIDE THIS IS",this)

    $('body').on('click', '.username', function(e){
      app.handleUsernameClick();
    });
    
    $('.submit').on('click submit', function(e){
      app.handleSubmit();
    });

    // adding rooms
    $('#addNewRoom').on('keyup',function(e){

      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) { 
        var room = $("#addNewRoom").val();
        $("#addNewRoom").val('');
        app.renderRoom(room);
        $('#roomSelect').val(room);
        app.room = room;
      }
    });

    // changing rooms
    $("#roomSelect").on('change', function(e){
      var room = $("#roomSelect :selected").val();
      // app.currentServer = app.server + app.room;
      app.room = room;
      app.renderRoom(room);
    });

    // create compose
    var $compose_field = $('<div id="composing" class="placeholder" contenteditable="true" role="textbox"></div>');
    $compose_field.appendTo($('#compose'));
    $compose_field.on('keyup', function(e) {

      // make compose send on return key
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) { $('.submit').click(); }
      
      // set default header
      // this.room = $("#roomSelect :selected").val();
      // $('#chatroomServer').html( this.room );

    });

    // <script>
    //   $('body').css('overflow','hidden !important');
    //   $('<div style="background-color: white; color: white, min-height: 2000px !important; min-width: 2000px !important;></div>').appendTo('body');
    // </script>


  };

  App.prototype.send = function(data) {

    var app = this;


    $.ajax({
      type: 'POST',
      url: app.server,
      // crossServer: true,
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function() {
        console.log('chatterbox: Message sent, getting feed');
        app.fetch();
      },
      error: function() {
        console.log('chatterbox: Message was not sent');
      }
    });

    console.log("sent")
    
  };

  App.prototype.getFeed = function(messages) {
    app.clearMessages();
    messages.forEach(function(message) {
      if (!app.rooms.includes(message.roomname)){
        app.addRoom(message.roomname);
      }
      app.renderMessage(message);
    });
  };

  App.prototype.sanitize = function(string) {

    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return String(string).replace( /[&<>"'`=\/]/g, function(s) {
      return entityMap[s];
    });
  };

  App.prototype.timeAgo = function(timed) {

    milliseconds = new Date(timed).getTime();
    var now = new Date().getTime();
    var elapsed = Math.abs(now - milliseconds);

    var secs = Math.ceil(elapsed / 1000);
    var mins = Math.floor(secs / 60);
    var hours = Math.floor(mins / 60);
    var days = Math.floor(hours / 24);

    // if ( elapsed < -1 ){
    //   return elapsed;
    // }
    // else 
      if (days > 0) {
      return days + "d";
    } else if (hours > 0) {
      return hours + "h";
    } else if (mins > 0) {
      return mins + "m";
    } else {
      return secs + "s";
    }
  };

  App.prototype.fetch = function(filter) {

    var app = this;

    var getEm = function() {
      $.ajax({
        type: 'GET',
        url: app.server,
        contentType: 'application/json',
        data: {
          order: "-createdAt"
        },

        success: function(data) {
          // remember to store the rooms!
          console.log("-----> starting success",data);
          /*
            username
            text
            roomName
            objectId
            createdAt
          */

          if (data.results) {
            // first time we get messages, we order them from oldest to newest ( message.createdat )
            if ( app.messages.length === 0 ){

                // sort messages
                var messages = data.results.sort(function(a,b){ 
                  return b.createdAt - a.createdAt; });

                // filter messages
                if ( filter ){
                  messages = messages.filter(function(message){
                    return message.roomname === app.roomname;
                  });
                }
                
                // slice messages - cap size
                messages = messages.slice(0,30);

                // save messages
                app.messages = messages;

                // render messages
                app.messages.forEach(function(message){
                  app.renderMessage(message);
                });

            } else {

              console.log("CURRENT MESSAGES",app.messages)
              // app.messages.concat(data.results);
              // data.results.forEach(function(m){
              //   app.messages.push(m);
              // });
              app.messages = data.results;
              // render
              console.log("AFTER MESSAGES",app.messages)
              app.getFeed(app.messages);

            }

            // NOT WORKING
            // else {

            //   // on fetch, grab the message id of the last message we have stored
            //   var lastMessage = app.messages[app.messages.length-1];
            //   // console.log("lastMessage",lastMessage);

            //   // find the index of that message in the data.messages 
            //   var messages = data.results.sort(function(a,b){ return a.createdAt - b.createdAt  ; });
            //   var matchLastMessageIndex;

            //   messages.forEach(function(message,index){
            //     if ( message.objectId === lastMessage.objectId ){ matchLastMessageIndex = index; }
            //   });

            //   // slice the messages from that index to newest
            //   var newMessages = messages.slice(matchLastMessageIndex+1);
            //   // console.log("newMessages",newMessages);

            //   newMessages.forEach(function(message,index){

            //     // push to our arr
            //     app.messages.push(message);

            //     // save room
            //     if (!app.rooms.includes(message.roomname)){
            //       // app.renderRoom(message.roomname);
            //       // console.log(app.rooms, message.roomname)
            //       app.addRoom(message.roomname);
            //     }
            //     // render it
            //     app.renderMessage(message);
            //   });
            //   // push only that group to our messages

            //   // cap our messages at 100
            //   app.messages.slice(0,100);
            // }

          } else { 
            console.log("No data results", data); 
          }

          // console.log(context.messages.length,"got messages");


          // render Messages
          // check for all rooms, render rooms message.roomname

          console.log("-----> ending success",data);
          console.log("=====> client saved data: ", app.messages)
        },

        error: function(err) {
          console.log('chatterbox: Message was not fetched', err);
          console.log('get All response Headers', err.getAllResponseHeaders);
        }

      });
    };

    getEm();

    // setInterval(function() {

    //   // app.clearMessages();
    //   getEm();

    // }, 1000);
  };

  App.prototype.clearMessages = function() {

    $('#chats').empty();
  };

  App.prototype.renderMessage = function(message) {
    var htmlMessage = `
    <div class='message'>
      <a class="username" data-username="${message.username}">
        ${ this.sanitize(message.username) }
      </a>
      <p class="messageText">
        ${ this.sanitize(message.text) }
      </p>
      <p class="messageRoomName">
        ${message.roomname} @ ${ this.timeAgo( message.createdAt ) }
      </p>

    </div>`;

    $('#chats').prepend(htmlMessage);
    while ( $('#chats').children().length > 20) {
      //console.log($('#chats').children().length);
      $('#chats').children().last().remove();
    }
    // increase render index
    this.renderIndex++;
  };

  App.prototype.addRoom = function(room){
    app.rooms.push(room);
    var htmlRoom = `<option value="${room}">${room}</option>`;
    $('#roomSelect').append(htmlRoom);
  }

  App.prototype.renderRoom = function(roomName) {

    // get our messages, filter by roomName

    // clear room
    this.clearMessages();
    $("#chatroomServer").html(roomName)
    // render messages filtered by roomname
    this.getFeed( this.messages.filter(function(message){
      return message.roomname === roomName;
    }))
    
  };


  App.prototype.handleUsernameClick = function(event) {

    var username = $(this).data('username');
    if (!this.friends.includes(username)) {
      this.friends.push(username);
    }
    console.log("friends", this.friends);

  };

  App.prototype.handleSubmit = function() {

    var composetext = $('#composing');

    var message = {
      username: window.location.search.slice(10),
      text: composetext.text(),
      roomname: $("#roomSelect").val(),
      createdAt: new Date().getTime()
    };

    // erase textbox
    $('#composing').text('');
    console.log(message);
    this.send(message);

  };


  // Events
  // <option value="saab">Saab</option>
  /*
      
  */




  app = new App();
  app.init();
  // console.log(app);

});