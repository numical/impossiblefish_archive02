define(["app/gui","lib/stacktrace"], function( GUI, generateStackTrace ){
    'use strict';
    return function(){

        var NEW_LINE = "\n",
            self = this,
            debugConsole = GUI.getDebugConsole();

        this.displayConsole = function(){
            GUI.getFishTankCanvas().style.height = "65vh";
            debugConsole.style.display = "block";
            debugConsole.addEventListener( "click", function(){
                window.prompt( "Copy to clipboard: Ctrl+C, Enter", debugConsole.value );
            } );
        };

        this.log = function( message ){
            message += NEW_LINE;
            debugConsole.value += message;
            debugConsole.scrollTop = debugConsole.scrollHeight;
        };

        this.logWithStackTrace = function( message ){
            message += NEW_LINE;
            var ignoreLines = 4;
            generateStackTrace().forEach( function( line ){
                if( --ignoreLines < 0 ){
                    message += line;
                    message += NEW_LINE;
                }
            } );
            self.log( message );
        };
    };
});

