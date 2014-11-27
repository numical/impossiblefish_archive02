define(["lib/stacktrace","app/util"], function( StackTrace, Util ){

    var
        NEW_LINE = "\n",
        console = document.getElementById( "debugConsole" ),

        publicContract = {

            displayConsole: function(){
                document.getElementById("fishTank").style.height = "70vh";
                document.getElementById( "popup" ).style.top = "70vh";
                console.style.display = "block";
                console.addEventListener( "click", function(){
                    window.prompt("Copy to clipboard: Ctrl+C, Enter", console.value );
                } );
            },

            log: function( message, includeStackTrace ){
                message += NEW_LINE;
                if ( includeStackTrace ) {
                    var ignoreLines = 4;
                    StackTrace().forEach( function( line ){
                        if ( --ignoreLines < 0 ) {
                            message += line;
                            message += NEW_LINE;
                        }
                    } );
                }
                console.value +=  message ;
                console.scrollTop = console.scrollHeight;
            }
        };

    return publicContract;
});

