define( ["app/gui", "app/util"],function( GUI, Util ){
    'use strict';

    var CONTROL_OPACITY = 1.0;

    return {
        init: function( commandQueue ){
            var container = GUI.getControlsContainer();
            var window = GUI.getWindow();

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
                function(event){
                    switch( event.target.id ){
                        case "addFish":
                            commandQueue.addFish();
                            break;
                        case "removeFish":
                            commandQueue.removeFish();
                            break;
                    }
                },
                false );
        }
    };
});

