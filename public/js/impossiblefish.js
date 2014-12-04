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
    var
        fishtank = new FishTank();

    // set up debugging if necessary
    Debug.init();

    // set up controls
    Controls.init( CommandQueue );

    // start fishtank animation
    fishtank.init();

    // wire up command queue
    CommandQueue.init( fishtank );
});








