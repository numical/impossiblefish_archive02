'use strict';
define( {
    getWindow: function(){
        return window;
    },
    getFishTankCanvas: function(){
        return document.getElementById("fishTank");
    },
    getFishTankContext: function(){
        return document.getElementById("fishTank").getContext("2d" );
    },
    getDebugConsole: function(){
        return document.getElementById( "debugConsole" );
    },
    getControlsContainer: function(){
        return document.getElementById("controls");
    },
    getLocationDisplay: function(){
        return document.getElementById("location");
    }
} );
