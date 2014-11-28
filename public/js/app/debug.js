define(["lib/stacktrace"], function( generateStackTrace ){
    'use strict';
    return function(){

        var NEW_LINE = "\n",
            self = this,
            console = document.getElementById( "debugConsole" );

        this.displayConsole = function(){
            document.getElementById( "fishTank" ).style.height = "70vh";
            document.getElementById( "popup" ).style.top = "70vh";
            console.style.display = "block";
            console.addEventListener( "click", function(){
                window.prompt( "Copy to clipboard: Ctrl+C, Enter", console.value );
            } );
        };

        this.log = function( message ){
            message += NEW_LINE;
            console.value += message;
            console.scrollTop = console.scrollHeight;
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

