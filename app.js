/**
 * Module dependencies.
 */

var express = require('express'),
    routes  = require('./routes'),
    redis   = require('redis'),
    fs      = require('fs'),
    publisherClient = redis.createClient();

var app = module.exports = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.sendfile(__dirname + '/views/index.html');
});

app.get('/update-stream', function(req, res) {
  // let request last as long as possible
  req.socket.setTimeout(Infinity);

  var messageCount = 0;
  var watcher = fs.watch('/Users/twileighducaucus/Documents/testdoc/', function(event, filename) {
    messageCount++; // Increment our message count

    res.write('id: ' + messageCount + '\n');
    res.write("data: " + filename + ' ' + (new Date).toString() + '\n\n');
  });

  //send headers for event-stream connection
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  // The 'close' event is fired when a user closes their browser window.
  // In that situation we want to make sure our redis channel subscription
  // is properly shut down to prevent memory leaks...and incorrect subscriber
  // counts to the channel.
  req.on("close", function() {
    watcher.close();
    watcher = null;
  });
});

app.get('/fire-event/:event_name', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('All clients have received "' + req.params.event_name + '"');
  res.end();
});

app.listen(8888);
console.log("Express server listening on port %d in %s mode", 8888, app.settings.env);
