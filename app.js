/**
 * Module dependencies.
 */

var express = require('express'),
    routes  = require('./routes'),
    fs      = require('fs'),
    radio   = require('radio');

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

//  var messageCount = 0;
//  var watcher = fs.watch('/Users/twileighducaucus/Documents/testdoc/', function(event, filename) {
//    messageCount++; // Increment our message count
//    res.write('id: ' + messageCount + '\n');
//    res.write("data: " + filename + ' ' + (new Date).toString() + '\n\n');
//  });

  radio('updateToLatestSync').subscribe(function(){
    console.log('first eventstream is firing');
    res.write("data: " + 'Sync from source to update current session.' + '\n\n');
  });
  radio('poo').subscribe(function(){
    console.log('poo eventstream is firing');
    res.write("data: " + 'rocks!' + '\n\n');
  });
  radio('foo').subscribe(function(){
    console.log('foo eventstream is firing');
    res.write("data: " + 'socks!' + '\n\n');
  });

  //send headers for event-stream connection
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');
//  req.on("close", function() {
//    watcher.close();
//    watcher = null;
//  });
});

app.get('/syncSuccess', function(req, res){
  radio('updateToLatestSync').broadcast();
  res.end();
})
app.get('/eStream2', function(req, res){
  radio('poo').broadcast();
  res.end();
})
app.get('/eStream3', function(req, res){
  radio('foo').broadcast();
  res.end();
})

app.listen(8888);
console.log("Express server listening on port %d in %s mode", 8888, app.settings.env);
