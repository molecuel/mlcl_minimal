'use strict';
const express = require('express');
const https = require('https');
const fs = require('fs');
const async = require('async');
const session = require('express-session');
const Molecuel = require('mlcl_core');
var config = require('config');
var ssl = config.server.ssl.enabled || false;
var excl = config.server.ssl.exclusive || false;
class mlclrunner {
    constructor() {
        process.on('SIGINT', function () {
            console.log('Server has shut down', 'Your Application is now offline');
            process.exit(0);
        });
        this.app = express();
        mlclrunner.molecuel = new Molecuel(config);
        if (config.session && config.session.secret) {
            this.app.use(session({ secret: config.session.secret, resave: true, saveUninitialized: true }));
        }
        mlclrunner.molecuel.on('init', () => {
            mlclrunner.molecuel.initApplication(this.app);
            if (mlclrunner.molecuel.serverroles && mlclrunner.molecuel.serverroles.server) {
                this.startHttp();
                this.startHttps();
            }
            else {
                mlclrunner.molecuel.log.info('molecuel', 'Running molecuel without server role');
            }
        });
    }
    sslOptions() {
        var options = {
            key: fs.readFileSync(__dirname + config.server.ssl.key),
            cert: fs.readFileSync(__dirname + config.server.ssl.cert),
            ciphers: '!aNULL:!ADH:!eNull:!LOW:!EXP:RC4+RSA:MEDIUM:HIGH',
            maxStreams: config.server.ssl.maxstreams
        };
        return options;
    }
    onStartServer() {
        console.log('Server started in ' + process.env.NODE_ENV + ' mode...', 'Ctrl+C to shut down');
    }
    startHttp() {
        if (ssl && excl) {
            var redirserver = express();
            redirserver.get('*', function (req, res) {
                var u = mlclrunner.molecuel.parseRequest(req);
                var port = config.server.ssl.port || 443;
                if (port === 443) {
                    port = '';
                }
                else {
                    port = ':' + port;
                }
                res.redirect('https://' + u.hostname + port + u.path);
            });
        }
        var hosts = config.server.host || ['127.0.0.1'];
        if (!(hosts instanceof Array)) {
            hosts = [hosts];
        }
        async.each(hosts, (host, cb) => {
            mlclrunner.molecuel.log.debug('server', 'start http server');
            let server = require('http').createServer(this.app);
            mlclrunner.molecuel.setServerInstance(server);
            server.listen(config.server.port, host, this.onStartServer);
            cb();
        });
    }
    startHttps() {
        if (!ssl)
            return;
        var hosts = config.server.ssl.host || config.server.host;
        if (!(hosts instanceof Array)) {
            hosts = [hosts];
        }
        if (hosts.length) {
            async.each(hosts, (host, cb) => {
                this.startHttpsServer(config.server.ssl.port, host, this.sslOptions());
                cb();
            });
        }
    }
    startHttpsServer(port, host, options) {
        mlclrunner.molecuel.log.debug('server', 'start https server');
        https.createServer(options, this.app).listen(port, host, this.onStartServer);
    }
}
module.exports = exports = new mlclrunner();
