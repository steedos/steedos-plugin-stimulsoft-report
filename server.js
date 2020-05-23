require('dotenv-flow').config();

var server = require('@steedos/meteor-bundle-runner');
var steedos = require('@steedos/core')
// import { init } from './lib/server/index';

server.Fiber(function () {
    try {
        server.Profile.run("Server startup", function () {
            server.loadServerBundles();
            steedos.init();
            server.callStartupHooks();

            server.runMain();
        })
    } catch (error) {
       console.error(error.stack)
    }
}).run()

