require.config({
    paths: {
        app: 'app',
        lib: 'lib'
    }
});

// wire up models to GUI
require(["app/commands", "app/fishtank", "app/controls", "app/debug"],
                function( CommandQueue, FishTank, Controls, Debug ){
    'use strict';
});








