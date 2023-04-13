var express = require('express');
var path = require('path');
var nocache = require('nocache');

var app = express();
var server = app.listen(32, function() {
  console.log("Pirate's Oasis game server started - NO cache in use");
});

app.use(nocache()); // prevent client caching for images, sounds etc
app.use('/assets', express.static(path.resolve('assets')));
app.use('/build', express.static(path.resolve('build')));
app.get('/', function(req, res) {
  res.sendFile(  __dirname + '/index.html' );
});
