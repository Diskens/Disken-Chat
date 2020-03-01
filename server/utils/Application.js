// Packages
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const SocketIo = require('socket.io');
var $ApiCallbacks = {};

exports.Application = class Application {
  constructor(port, publicDirectory) {
    this.express = express();
    this.express.use(express.static(publicDirectory));
    this.express.use(favicon(publicDirectory+'/favicon.ico'))
    this.server = http.createServer(this.express);
    this.io = SocketIo.listen(this.server);
    this.server.listen(port);
    this.port = port;
  }
  begin() {
    console.log(`[App] Starting the application at *:${this.port}`);
    this.io.on('connection', (socket) => {
      var entries = Object.entries($ApiCallbacks);
      for (const [key, value] of entries) {
        if (key == 'connection') continue;
        socket.on(key, function(evt){value(socket, evt)});
      }
      if ($ApiCallbacks['connection']) $ApiCallbacks['connection'](socket);
    })
  }
  addApi(api) {
    for (var apiKey in api.map) {
      console.log(`[App] New API entry "${apiKey}"`, api.map[apiKey]);
      $ApiCallbacks[apiKey] = api.map[apiKey];
    }
  }
}
