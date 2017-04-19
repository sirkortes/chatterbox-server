var fs = require('fs');
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var messages = [];

var requestHandler = function(request, response) {

  console.log("\n\n\nGOOGLE TEAM IN THE HOUSE!\n\n\n");

  // basic parts
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var results = messages;
  var statusCode = 200;

  // || request.url.includes('/?username') 
  // console.log("MATCHING",request.url,request.url.match('/classes/messages'))
  if ( request.url.includes('classes/messages') ) {
    
    // return;
    request.on('error', function(err) {
      // ERROR ON REQUESTING
      // console.log("ERRROR",err)
      statusCode = 404;
    });

    request.on('data', function(message) {

      if (message !== undefined) {
        results.push(message);
        statusCode = 201;
      }
    });

    request.on('end', function() {

      results = results.map( message => JSON.parse( message.toString() ) );
      
      // start building response
      var headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(statusCode, headers);

      // create body
      var responseBody = { results: results };

      // finish response and send
      response.end(JSON.stringify(responseBody));
    });



  }

  else if ( request.url[0] === "/" ){

      // console.log("\n\n\nHEADERS",request.headers.accept)
      // console.log("HOME URL",request)

      var first = true;

      if ( first ){

        first = false;
        fs.readFile("client/index.html", function(err, text) {
          response.setHeader("Content-Type", request.headers.accept);

          console.log("\n\n\nHEADERS",response._headers )

          response.end(text.toString());
        })
        
      } else {

        fs.readFile(("client/"+request.url), function(err, text) {
          response.setHeader("Content-Type", request.headers.accept );

          console.log("\n\n\nHEADERS",response._headers )

          response.end(text.toString());
        })

      }

  }

  else {

    console.log("ELSE ERRROR",request.url, Object.keys(request) )
    response.statusCode = 404;
    response.end();
  }

};

module.exports.requestHandler = requestHandler;