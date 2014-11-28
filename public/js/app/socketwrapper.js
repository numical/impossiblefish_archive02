define(["lib/socket.io-1.1.0", "app/messages"],function( io, Messages ) {
    'use strict';
    return function( commandQueue ){

        var socket = null;

        this.connectToServer = function() {
            try {
                socket = io.connect();

                socket.on( Messages.TANK_UPDATE, function( tankDescriptor ){
                    commandQueue.updateTank( tankDescriptor );
                } );

                socket.on( Messages.FISH_TELEPORT, function( fishDescriptor ){
                    commandQueue.addFish( fishDescriptor );
                });

                return true;
            }
            catch( ex ) {
                console.log( "Connection error: " + ex );
                return false;
            }
        };

        this.teleportFish = function( fish ) {
            if ( socket && socket.connected ) {
                try {
                    socket.emit( Messages.FISH_TELEPORT, fish.getDescriptor() );
                    return true;
                } catch ( ex ){
                    console.log( "Teleport error: " + ex );
                    return false;
                }

            } else {
                return false;
            }
        };
    };
});
