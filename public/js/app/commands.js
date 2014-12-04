define( ["app/fish", "app/messages", "app/util", "lib/socket.io-1.1.0"],
    function( Fish, Messages, Util, IO){
        'use strict';
        var
            self = this,
            commandQueue = [],
            fishtank = null,
            socket = null,
            newFishCount = 0,
            publicContract = null,

            processCommands = function(){
                setTimeout( function(){
                    if( commandQueue.length > 0 ){
                        var command = commandQueue.shift();
                        command.action.call( self, command.arg );
                    }
                    processCommands();
                }, 100 );
            },

            updateTankAction = function( tankDescriptor ){
                fishtank.updateConnectedTanks( tankDescriptor );
            },

            addFishAction = function( fishDescriptor ){
                if( !fishDescriptor ){
                    fishDescriptor = new Messages.FishDescriptor(
                        ++newFishCount,
                        0.5,
                        0.5,
                        Util.random( 0, 2 * Math.PI ) );
                }
                var fish = new Fish( publicContract, fishtank, fishDescriptor );
                fishtank.addFish( fish );
            },

            removeFishAction = function( fish ){
                fishtank.removeFish( fish );
            },

            connectToServerAction = function(){
                try{
                    socket = IO.connect();

                    socket.on( Messages.TANK_UPDATE, function( tankDescriptor ){
                        commandQueue.push( {action: updateTankAction, arg: tankDescriptor} );
                    } );

                    socket.on( Messages.FISH_TELEPORT, function( fishDescriptor ){
                        commandQueue.push( {action: addFishAction, arg: fishDescriptor} );
                    } );

                    return true;
                }
                catch( ex ){
                    console.log( "Connection error: " + ex );
                    return false;
                }
            },

            teleportFishAction = function( fish ){
                if( socket && socket.connected ){
                    try{
                        socket.emit( Messages.FISH_TELEPORT, fish.getDescriptor() );
                        commandQueue.push( {action: removeFishAction, arg: fish} );
                    } catch( ex ){
                        console.log( "Teleport error: " + ex );
                        fish.show();
                    }

                } else{
                    fish.show();
                }
            };

        publicContract = {

            init: function( fishTank ){
                fishtank = fishTank;
                processCommands();
                // delay as a gross way of avoiding duplicated refreshes
                commandQueue.push( {action: connectToServerAction} );
            },

            addFish: function( fishDescriptor ){
                commandQueue.push( {action: addFishAction, arg: fishDescriptor} );
            },

            removeFish: function(){
                commandQueue.push( {action: removeFishAction} );
            },

            teleportFish: function( fish ){
                commandQueue.push( {action: teleportFishAction, args: fish} );
            }
        };

        return publicContract;
    } );