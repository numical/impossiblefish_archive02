// Socket Wrapper  module requires the Util module
define(["socketio"],function( io ) {

    return function(){

        var socket = null;

        this.connectToServer = function() {
            try {
                if ( socket ) {
                    socket.connect();
                } else {
                    socket = io.connect();
                }
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
