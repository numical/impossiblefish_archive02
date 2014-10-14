new function(){

    var
        TERMINATION_SIGNALS = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'],
        ONE_DAY = 86400000;

    var
        requirejs = require( 'requirejs'),
        express = require( 'express'),
        expressApp = express(),
        fileServer = require( 'http').Server( expressApp ),
        compression = require('compression'),
        socketsServer = require( 'socket.io' )( fileServer, { serveClient: false } ),
        ipAddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
        port = process.env.OPENSHIFT_NODEJS_PORT || 8008,

        configureAccessToCommonBrowserCode = function() {
            requirejs.config({
                nodeRequire: require,
                baseUrl: __dirname + '/public/js'
            });
        },

        setupTerminationHandlers = function() {
            process.on('exit', function () {
                terminator();
            });

            TERMINATION_SIGNALS.forEach(function (element, index, array) {
                process.on(element, function () {
                    terminator(element);
                });
            })
        },

        terminator = function(sig){
            if (typeof sig === "string") {
                console.log('%s: Received %s - terminating...',
                    Date(Date.now()), sig);
                process.exit(1);
            }
            console.log('%s: Node server stopped.', Date(Date.now()) );
        },
        
        setupExpressServer = function() {
            expressApp.use( compression() );
            expressApp.use( express.static(__dirname + '/public' ,{ maxAge: ONE_DAY }));
        },

        setupSocketsServer = function( MessageFactory ){
            socketsServer.on( 'connection', function( socket ){
                console.log('%s: Client socket connected', Date(Date.now()) );

                socket.on( 'reconnect', function(){
                    console.log('%s: Client socket reconnected', Date(Date.now()) );
                } );

                socket.on( 'disconnect', function(){
                    console.log('%s: Client socket disconnected', Date(Date.now()) );
                } );

                socket.on ( MessageFactory.REQUEST_FISHTANK_METADATA, function( name, callbackOnClient ){
                    callbackOnClient( MessageFactory.createFishtankMetadata( socket.id ) );
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
    requirejs(["app/messagefactory"],function( MessageFactory ){
        setupSocketsServer( MessageFactory );
    } );

    start();

}();



