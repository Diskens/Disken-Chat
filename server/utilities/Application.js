var $LOG;

// Packages
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const SocketIo = require('socket.io');
const fs = require('fs');

// Globals
var Callbacks = {};

exports.Application = class Application {
  constructor(_log, port, publicDir, faviconFn='/favicon.ico') {
    $LOG = _log;
    this.express = express();
    this.express.use(express.static(publicDir));
    this.express.use(favicon(publicDir + faviconFn));
    this.server = http.createServer(this.express);
    this.io = SocketIo.listen(this.server);
    this.server.listen(port);
    this.port = port;
  }
  begin() {
    $LOG.entry('App', `Listening to *:${this.port}`);
    this.io.on('connection', (socket) => {
      var entries = Object.entries(Callbacks);
      for (const [key, value] of entries) {
        if (key == 'connection') continue;
        socket.on(key, function(evt){value(socket, evt)});
      }
      if (Callbacks['connection']) Callbacks['connection'](socket);
    });
  }
  addAPI(api) {
    for (var apiKey in api.callbacks) {
      $LOG.entry('App', `Added API callback for "${apiKey}"`);
      Callbacks[apiKey] = api.callbacks[apiKey];
    }
  }
}
