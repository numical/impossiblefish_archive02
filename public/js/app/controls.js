define( ["app/commands", "app/gui", "app/util"], function( CommandQueue, GUI, Util ){
    'use strict';

    var CONTROL_OPACITY = 1.0,
        init = function(){
            var container = GUI.getControlsContainer(),
                window = GUI.getWindow();

            // control visibility
            container.style.opacity = CONTROL_OPACITY;
            container.addEventListener(
                'mouseover',
                function(){
                    Util.fadeIn( container, CONTROL_OPACITY );
                },
                false );
            container.addEventListener(
                'mouseout',
                function(){
                    Util.fadeOut( container, CONTROL_OPACITY );
                },
                false );

            // wire up click event
            window.addEventListener(
                'click',
                function( event ){
                    switch( event.target.id ){
                        case "addFish":
                            CommandQueue.addFish();
                            break;
                        case "removeFish":
                            CommandQueue.removeFish();
                            break;
                    }
                },
                false );
        };

    init();
    return true;
} );

