new function(){

    var
        DEFAULT_IP_ADDRESS =  "127.0.0.1",
        DEFAULT_IP_PORT = 8008,
        TERMINATION_SIGNALS = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'],
        ONE_DAY = 86400000;

    var
        express = require( 'express'),
        compression = require('compression'),
        app = express(),
        ipaddress = process.env.OPENSHIFT_NODEJS_IP || DEFAULT_IP_ADDRESS,
        port = process.env.OPENSHIFT_NODEJS_PORT || DEFAULT_IP_PORT,

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
        
        setupFileServer = function() {
            app.use( compression() );
            app.use( express.static(__dirname + '/public',{ maxAge: ONE_DAY }));          
        },
        
        start = function(){
            app.listen( port, ipaddress, function(){
                console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ipaddress, port);
            });
    };

    setupTerminationHandlers();
    setupFileServer();
    start();

}();



