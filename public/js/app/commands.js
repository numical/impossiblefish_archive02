define( function(){
        'use strict';
        var
            self = this,
            commandQueue = [],
            fishTank = null,
            socketWrapper = null,

            addFishCommand = function( fishDescriptor ){
                fishTank.addFish( fishDescriptor );
            },

            removeFishCommand = function( fish ){
                fishTank.removeFish( fish );
            },

            teleportFishCommand = function( fish ){
                if ( socketWrapper.teleportFish( fish ) ) {
                    fishTank.removeFish( fish );
                } else {
                    fish.show();
                }
            },

            updateTankCommand = function( tankDescriptor ){
                fishTank.updateConnectedTanks( tankDescriptor );
            },

            scheduleCommand = function( command, arg ) {
                commandQueue.push( { action: command, arg: arg } );
            },

            processNextCommand = function(){
                setTimeout( function(){
                    if( commandQueue.length > 0 ){
                        var command = commandQueue.shift();
                        command.action.call( self, command.arg );
                    }
                    processNextCommand();
                }, 100 );
            };

        return {
            init: function( fishtank, socketwrapper ){
                fishTank = fishtank;
                socketWrapper = socketwrapper;
                processNextCommand();
                scheduleCommand( function(){ socketWrapper.connectToServer(); } );
            },
            addFish: function(  fishDescriptor ){
                scheduleCommand( addFishCommand, fishDescriptor );
            },
            removeFish: function(  fish ){
                scheduleCommand( removeFishCommand, fish );
            },
            teleportFish: function(  fish ){
                scheduleCommand( teleportFishCommand, fish );
            },
            updateTank: function( tankDescriptor ) {
                scheduleCommand( updateTankCommand, tankDescriptor );
            }
        };
    } );