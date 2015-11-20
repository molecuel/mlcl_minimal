import express = require('express');
declare class mlclrunner {
    private static molecuel;
    app: express.Application;
    constructor();
    private sslOptions();
    private onStartServer();
    private startHttp();
    private startHttps();
    private startHttpsServer(port, host, options);
}
export = mlclrunner;
