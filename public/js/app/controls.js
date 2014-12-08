define( ["app/commands", "app/messages", "app/gui", "app/util"],
            function( CommandQueue, Messages, GUI, Util ){
    'use strict';

    var CONTROL_OPACITY = 1.0,

        container = GUI.getControlsContainer(),
        window = GUI.getWindow(),
        addedFishes = 0,

        addFish = function(){
            var fishDescriptor = new Messages.FishDescriptor(
                ++addedFishes,
                0.5,
                0.5,
                Util.random( 0, 2 * Math.PI ) );
            CommandQueue.addFish( fishDescriptor );
        },

        removeFish = function() {
            CommandQueue.removeFish();
        },

        init = function(){
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
                            addFish();
                            break;
                        case "removeFish":
                            removeFish();
                            break;
                    }
                },
                false );
        };

    init();
    return true;
} );

