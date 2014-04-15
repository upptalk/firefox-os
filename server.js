'use strict';

var express = require('express');
var path = require('path');

var config = require('./config.js');

var publicFolder = config.publicFolder;

//directories
var publicPath = path.join(__dirname, publicFolder);
var resourcesPath = path.join(publicPath, 'resources');
//files
var indexPath = path.join(publicPath, 'index.xhtml');
var faviconPath = path.join(resourcesPath, 'images', 'icons', '16.png');

var app = express();
app.use(express.logger());
app.use(express.favicon(faviconPath));
app.use('/resources', express.static(resourcesPath));
app.get('/package.zip', function(req, res) {
  res.sendfile(path.join(publicFolder, 'package.zip'));
});
app.get('/*.webapp', function(req, res) {
  res.set({
    'Content-Type': 'application/x-web-app-manifest+json'
  });
  res.sendfile(path.join(publicFolder, req.params[0]) + '.webapp');
});
app.get('/package.manifest', function(req, res) {
  res.set({
    'Content-Type': 'application/json'
  });
  res.sendfile(path.join(publicFolder, 'package.manifest'));
});
app.get('/*', function(req, res) {
  res.set({
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src *; media-src *; connect-src *; script-src 'self' 'unsafe-eval'"
  });
  res.sendfile(indexPath);
});

app.listen(config.port);