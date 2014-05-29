/**
 * Module dependencies.
 */

var express = require( 'express' ),
    cookieParser = require( 'cookie-parser' ),
    fs      = require( 'fs' ),
    routes  = require( './routes' );

var app = module.exports = express();

// Configuration
app.configure(function(){
  app.set( 'views', __dirname + '/views' );
  app.use( express.bodyParser() );
  app.use( express.json() );
  app.use( express.methodOverride()  );
  app.use( app.router );
  app.use( express.static( __dirname + '/public' ) );
  app.use( cookieParser() );
  app.use( express.logger( "dev" ) );
});

app.configure( 'development', function(){
  app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ));
});

app.configure( 'production', function(){
  app.use( express.errorHandler() );
});

// Configure routes
routes( app );

// Start the app
app.listen( 8888 );
console.log( "Express server listening on port %d in %s mode", 8888, app.settings.env );
