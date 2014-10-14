// Socket Wrapper  module requires the Util module
define(["lib/socket.io-1.1.0", "app/messagefactory"],function( io, MessageFactory ) {

    return function(){

        var
            socket = null,
            metadata = null;

        this.connectToServer = function() {
            try {
                if ( socket ) {
                    socket.connect();
                } else {
                    socket = io.connect();
                }

                socket.on ('connect', function(){
                    socket.emit( MessageFactory.REQUEST_FISHTANK_METADATA, null, function( fishtankMetaData  ){
                        metadata = fishtankMetaData;
                        console.log( "Fishtank Id is " + metadata.id );
                    } );
                });

                return true;
            }
            catch( ex ) {
                console.log( "Connection error: " + ex );
                return false;
            }
        }

        this.disconnectFromServer = function() {
            try {
                socket.disconnect();
                return true;
            }
            catch( ex ) {
                console.log( "Disconnection error: " + ex );
                return false;
            }
        }

    };
});
