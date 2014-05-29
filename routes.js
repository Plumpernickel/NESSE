// Global requires
var radio = require( 'radio' );

// Stub session generation/authentication logic
function sessionGen( req, res, next ) {
  req.session = req.session || {};
  req.session.username = "classic_steve";
  next();
}

var eventSourceHelper = {
  sendOutOfDateMsg: function( connectionId, res ){
    return function(username, id) {
      if (connectionId != id) {
        res.write("data: " + 'You are out of date! Sync from source to update current session.' + '\n\n');
      }
    };
  }
};

// Local storage of connection info
var syncSessions = {};
var connectedClients = {};

module.exports = function( app ) {
  app.get( '/', sessionGen, function( req, res ){
    res.sendfile(__dirname + '/views/index.html');
  });

  app.get( '/update-stream', sessionGen, function( req, res ) {
    var username = req.session.username,
        connectionId = Date.now();

    // let request last as long as possible
    req.socket.setTimeout(Infinity);

    // We're assuming one user, but this is where we'd add a new user to
    // the object that keeps track of them
    if (!connectedClients[username]) {
      connectedClients[username] = {};
    }
    connectedClients[username][connectionId] = {};

    radio('updateToLatestSync').subscribe( eventSourceHelper.sendOutOfDateMsg( connectionId, res ) );

    //send headers for event-stream connection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    var data = {
      connectionId: connectionId
    };
    res.write("data: " + JSON.stringify(data) + "\n\n");

    // Stream has closed
    req.on("close", function() {
      delete connectedClients[username][connectionId];
    });
  });

  // GET /syncSuccess?connectionId=foo
  app.get( '/syncSuccess', sessionGen, function( req, res ){
    var username = req.session.username,
        connectionId = req.query.connectionId;

    radio( 'updateToLatestSync' ).broadcast( req.session.username, connectionId );

    res.end();
  })
}
