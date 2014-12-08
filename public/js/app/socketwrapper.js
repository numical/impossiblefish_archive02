define( ["app/commands","lib/socket.io-1.1.0", "app/messages"],
        function( CommandQueue, IO, Messages ){
    'use strict';
    var socket = null;
    return {
        connectToServer: function(){
            try{
                socket = IO.connect();

                socket.on( Messages.TANK_UPDATE, function( tankDescriptor ){
                    CommandQueue.updateTank( tankDescriptor );
                } );

                socket.on( Messages.FISH_TELEPORT, function( fishDescriptor ){
                    CommandQueue.addFish( fishDescriptor );
                } );

                return true;
            }
            catch( ex ){
                console.log( "Connection error: " + ex );
                return false;
            }
        },

        teleportFish: function( fish ){
            if( socket && socket.connected ){
                try{
                    socket.emit( Messages.FISH_TELEPORT, fish.getDescriptor() );
                    return true;
                } catch( ex ){
                    console.log( "Teleport error: " + ex );
                    return false;
                }
            } else{
                return false;
            }
        }
    };

} );
