new function(){
    'use strict';
    var
        TERMINATION_SIGNALS = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'],
        ONE_DAY = 86400000,

        express = require( 'express' ),
        expressApp = express(),
        fileServer = require( 'http').Server( expressApp ),
        compression = require('compression'),
        socketsServer = require( 'socket.io' )( fileServer, { serveClient: false } ),
        ipAddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
        port = process.env.OPENSHIFT_NODEJS_PORT || 8008,
        requirejs = require( 'requirejs'),
        rootDir = __dirname,
        liveFishTanks = null,
        geocoder = null,

        configureAccessToCommonBrowserCode = function() {
            requirejs.config({
                nodeRequire: require,
                baseUrl: rootDir + '/public/js'
            });
        },

        terminator = function(sig){
            if (typeof sig === "string") {
                console.log('%s: Received %s - terminating...',
                    Date(Date.now()), sig);
                process.exit(1);
            }
            console.log('%s: Node server stopped.', Date(Date.now()) );
        },

        setupTerminationHandlers = function() {
            process.on('exit', function () {
                terminator();
            });

            TERMINATION_SIGNALS.forEach(function (element) {
                process.on(element, function () {
                    terminator(element);
                });
            });
        },


        setupExpressServer = function() {
            expressApp.use( compression() );
            expressApp.use( express.static( rootDir + '/public' ,{ maxAge: ONE_DAY }));
        },

        setupFishTanks = function( Messages ) {
            liveFishTanks = require( './app_modules/livefishtanks' )( Messages );
        },

        setupGeocoding = function( Messages ) {
            geocoder = require( './app_modules/geocoding' )( Messages );
        },

        setupSocketsServer = function( Messages ){
            socketsServer.on( 'connection', function( socket ){
                console.log('%s: Client socket connected: %s', Date(Date.now()), socket.id );
                liveFishTanks.addFishTankWithSocket( socket );

                socket.on( 'disconnect', function(){
                    console.log('%s: Client socket disconnected: %s', Date(Date.now()), socket.id );
                    liveFishTanks.removeFishTankWithSocket( socket );
                } );

                socket.on( Messages.FISH_TELEPORT, function( fishDescriptor ){
                    liveFishTanks.teleportFishFromSocket( socket, fishDescriptor );
                } );
            } );
        },
        
        start = function(){
            fileServer.listen( port, ipAddress, function(){
                console.log('%s: Node server started on %s:%d ...', Date(Date.now()), ipAddress, port);
            });
    };

    configureAccessToCommonBrowserCode();
    setupTerminationHandlers();
    setupExpressServer();
    requirejs(["app/messages"],function( Messages ){
        setupFishTanks( Messages );
        setupGeocoding( Messages );
        setupSocketsServer( Messages );
        start();
    } );
}();



