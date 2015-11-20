'use strict';
/// <reference path="typings/underscore/underscore.d.ts"/>
/// <reference path="typings/node/node.d.ts"/>
/// <reference path="typings/express/express.d.ts"/>
/// <reference path="typings/express-session/express-session.d.ts"/>

// # Module dependencies
import express = require('express');
import https   = require('https');
import fs      = require('fs');
import _       = require('underscore');
import session = require('express-session');
import Molecuel = require('mlcl_core');

var config  = require('config');
var ssl = config.server.ssl.enabled || false;
var excl = config.server.ssl.exclusive || false;

class mlclrunner {
  private static molecuel:Molecuel;
  public app:express.Application;
  constructor() {
    // ensure that server exits correctly on Ctrl+C
    process.on('SIGINT', function () {
      console.log(
        'Server has shut down',
        'Your Application is now offline'
      );
      process.exit(0);
    });

    this.app = express();

    mlclrunner.molecuel = new Molecuel(config);

    if(config.session && config.session.secret) {
      this.app.use(session({secret: config.session.secret, resave: true, saveUninitialized: true}));
    }

    this.app.get('/test', function(req, res) {
      res.sendStatus(200);
    });

    mlclrunner.molecuel.on('init', () => {
      mlclrunner.molecuel.initApplication(this.app);
      if(mlclrunner.molecuel.serverroles && mlclrunner.molecuel.serverroles.server) {
          this.startHttp();
          this.startHttps();
      } else {
          mlclrunner.molecuel.log.info('molecuel','Running molecuel without server role')
      }
    })
  }
  private sslOptions() {
    var options = {
      key: fs.readFileSync(__dirname + config.server.ssl.key),
      cert: fs.readFileSync(__dirname + config.server.ssl.cert),
      //ca: fs.readFileSync(__dirname + config.server.ssl.ca),
      ciphers: '!aNULL:!ADH:!eNull:!LOW:!EXP:RC4+RSA:MEDIUM:HIGH',
      maxStreams: config.server.ssl.maxstreams
    };
    return options;
  }
  private onStartServer() {
    console.log(
      'Server started in '+ process.env.NODE_ENV +' mode...',
      'Ctrl+C to shut down'
    );
  }
  private startHttp() {
    var server:express.Application = this.app;
    // Redirect all http requests to https if exclusive mode is enabled
    if(ssl && excl) {
      //set up plain http server for redirection
      var redirserver:express.Application = express();
      redirserver.get('*', function(req, res) {
        var u = mlclrunner.molecuel.parseRequest(req);
        var port = config.server.ssl.port || 443;
        if(port === 443) {
          port = '';
        } else {
          port = ':'+port;
        }
        res.redirect('https://' + u.hostname + port + u.path);
      });
    }

    // Initialize the hosts
    var hosts = config.server.host || ['127.0.0.1'];
    if(!(hosts instanceof Array)) {
      hosts = [hosts];
    }
    _.each(hosts, (host: string) => {
      server.listen(config.server.port, host, this.onStartServer);
    });
  }
  private startHttps() {
    if(!ssl) return;
    var hosts = config.server.ssl.host || config.server.host;
    if(!(hosts instanceof Array)) {
      hosts = [hosts];
    }
    if(hosts.length) {
      _.each(hosts, (host: string) => {
        this.startHttpsServer(config.server.ssl.port, host, this.sslOptions());
      });
    }
  }
  private startHttpsServer(port: number, host: string, options) {
    mlclrunner.molecuel.log.debug('server', 'start https server');
    https.createServer(options, this.app).listen(
      port, host, this.onStartServer
    );
  }
}

new mlclrunner();
export = mlclrunner;
