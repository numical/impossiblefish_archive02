// wire up models to GUI
require(["fishtank","util"],function( FishTank, Util ){

    var
        // set up GUI container - the fishtank
        canvas = document.getElementById("fishTank"),
        bounds = {
            height: 300,
            width: 150
        },
        fishtank = new FishTank( canvas.getContext("2d"), bounds ),

        // set up control container
        CONTROL_OPACITY = 0.6,
        controls = document.getElementById("controls"),

        fadeIn =  function(){
            Util.fadeIn( controls, CONTROL_OPACITY )
        },

        fadeOut =  function(){
            Util.fadeOut( controls, CONTROL_OPACITY )
        },

        connectToServer = function(){
            if ( fishtank.connectToServer() ) {
                canvas.style.borderStyle = "dashed solid dashed solid";
                return true;
            } else {
                canvas.style.borderStyle = "solid";
                return false;
            }
        },

        // dynamic sizing of canvas and fish tank
        layout = function() {
            bounds.height = canvas.clientHeight;
            bounds.width =  canvas.clientWidth;
            canvas.height = bounds.height;
            canvas.width = bounds.width;
        },

        // event propagation
        eventPropagation = function(event) {
            switch (event.target.id) {
                case "addFish":
                    fishtank.addFish();
                    break;
                case "removeFish":
                    fishtank.removeFish();
                    break;
                case "fishTank":
                    fishtank.togglePause();
                    break;
                case "serverCommand":
                    switch ( event.target.text ) {
                        case "Connect":
                            if ( fishtank.connectToServer() ) {
                                canvas.style.borderStyle = "dashed solid dashed solid";
                                event.target.text = "Disconnect";
                            }
                            break;
                        case "Disconnect":
                            if ( fishtank.disconnectFromServer() ) {
                                canvas.style.borderStyle = "solid";
                                event.target.text = "Connect";
                            }
                            break;
                    }
                    break;
            }
        };


    // set up dynamic sizing
    window.addEventListener('resize', layout, false);
    window.addEventListener('orientationchange', layout, false);
    layout();

    // control visibility
    controls.style.opacity = CONTROL_OPACITY;
    controls.addEventListener('mouseover', fadeIn, false );
    controls.addEventListener('mouseout',  fadeOut, false );

    // wire up click event
    window.addEventListener('click', eventPropagation, false );

})








