// Socket Wrapper  module requires the Util module
define(["lib/socket.io-1.1.0", "messages"],function( io, Messages ) {

    return function(){

        var
            socket = null,
            fishTankDescriptor = null,

            requestDescriptor = function(){
                socket.emit( Messages.TANK_UPDATE, null, function( descriptor  ){
                    fishTankDescriptor = descriptor;
                    console.log( "Fishtank Id is " + descriptor.id );
                } );
            };

        this.connectToServer = function() {
            try {
                if ( socket ) {
                    socket.connect();
                } else {
                    socket = io.connect();
                }

                socket.on ('connect', requestDescriptor );
                socket.on ('reconnect', requestDescriptor );

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
