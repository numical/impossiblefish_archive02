define(["app/gui","app/util","lib/stacktrace"], function( GUI, Util, generateStackTrace ){
    'use strict';

    var NEW_LINE = "\n",
        mode = null,
        debugConsole = null,

        activeMode = {
            displayConsole: function(){
                GUI.getFishTankCanvas().style.height = "65vh";
                debugConsole.style.display = "block";
                debugConsole.addEventListener( "click", function(){
                    window.prompt( "Copy to clipboard: Ctrl+C, Enter", debugConsole.value );
                } );
            },
            log: function( message ){
                message += NEW_LINE;
                debugConsole.value += message;
                debugConsole.scrollTop = debugConsole.scrollHeight;
            },
            logWithStackTrace: function( message ){
                message += NEW_LINE;
                var ignoreLines = 4;
                generateStackTrace().forEach( function( line ){
                    if( --ignoreLines < 0 ){
                        message += line;
                        message += NEW_LINE;
                    }
                } );
                mode.log( message );
            }
        },

        dummyMode = {
            displayConsole: function(){},
            log: function(){},
            logWithStackTrace: function(){}
        };

    if ( Util.getURLParameter( "debug" ) ){
        debugConsole = GUI.getDebugConsole();
        mode = activeMode;
    } else {
        mode = dummyMode;
    }
    return mode;

});

