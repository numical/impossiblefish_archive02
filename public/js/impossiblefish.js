require.config({
    paths: {
        app: 'app',
        lib: 'lib'
    }
});

// wire up models to GUI
require(["app/commands", "app/fishtank", "app/socketwrapper", "app/controls", "app/location","app/debug"],
                function( CommandQueue, FishTank, SocketWrapper, Controls, Location, Debug ){
    'use strict';
    CommandQueue.init( FishTank, SocketWrapper );
});








