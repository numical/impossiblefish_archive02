require.config({
    paths: {
        app: 'app',
        lib: 'lib'
    }
});

// wire up models to GUI
require(["app/commands", "app/fishtank", "app/socketwrapper","app/util"],
                function( CommandQueue, FishTank, SocketWrapper, Util ){

    var
        canvas = document.getElementById("fishTank"),
        fishtank = new FishTank( canvas ),
        socketwrapper = new SocketWrapper( CommandQueue ),


        // set up control container
        CONTROL_OPACITY = 0.6,
        controls = document.getElementById("controls"),

        fadeIn =  function(){
            Util.fadeIn( controls, CONTROL_OPACITY )
        },

        fadeOut =  function(){
            Util.fadeOut( controls, CONTROL_OPACITY )
        },

        // event propagation
        eventPropagation = function(event) {
            switch (event.target.id) {
                case "addFish":
                    CommandQueue.addFish();
                    break;
                case "removeFish":
                    fishtank.removeFish();
                    break;
                case "fishTank":
                    fishtank.togglePause();
                    break;
            }
        };


    // set up dynamic sizing
    window.addEventListener('resize', fishtank.resize, false);
    window.addEventListener('orientationchange', fishtank.resize, false);
    fishtank.resize();

    // control visibility
    controls.style.opacity = CONTROL_OPACITY;
    controls.addEventListener('mouseover', fadeIn, false );
    controls.addEventListener('mouseout',  fadeOut, false );

    // wire up click event
    window.addEventListener('click', eventPropagation, false );

    // debugging
    if ( Util.getURLParameter( "debug") ) {
        document.getElementById( "debugConsole" ).style.display = "block";
        canvas.style.height = "70vh";
        controls.style.height
    }

    // wire up command queue
    CommandQueue.init( fishtank, socketwrapper, canvas );

    // delay as a gross way of avoiding duplicated refreshes
    CommandQueue.connectToServer();
})








