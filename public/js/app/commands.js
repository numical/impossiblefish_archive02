define( ["app/fish", "app/messages", "app/util"], function( Fish, Messages, Util ){

    return function( fishTank, canvas, debug ){

        var
            self = this,
            commands = [],
            socketwrapper = null,
            guiContext = canvas.getContext( "2d" ),
            newFishCount = 0,

            processCommands = function(){
                setTimeout( function(){
                    if( commands.length > 0 ){
                        var command = commands.shift();
                        command.action.apply( self, command.args );
                    }
                    processCommands();
                }, 100 );
            },

            connectToServerAction = function(){
                socketwrapper.connectToServer();
            },

            addFishAction = function( fishDescriptor ){
                if( !fishDescriptor ){
                    fishDescriptor = new Messages.FishDescriptor(
                        "" + ++newFishCount,
                        0.5,
                        0.5,
                        Util.random( 0, 2 * Math.PI ) );
                }
                var fish = new Fish( self, guiContext, fishTank, fishDescriptor, debug );
                fishTank.addFish( fish );
            },

            removeFishAction = function(){
                fishTank.removeFish();
            },

            teleportFishAction = function( fish ){
                if( socketwrapper.teleportFish( fish ) ){
                    fishTank.removeFish( fish );
                } else{
                    fish.show();
                }
            },

            updateTankAction = function( tankDescriptor ){
                fishTank.updateConnectedTanks( tankDescriptor );
            };

        this.init = function( socketWrapper ){
            socketwrapper = socketWrapper;
            processCommands();
        };

        this.connectToServer = function(){
            commands.push( {action: connectToServerAction} );
        };

        this.addFish = function( fishDescriptor ){
            commands.push( {action: addFishAction, args: [fishDescriptor]} );
        };

        this.removeFish = function(){
            commands.push( {action: removeFishAction} );
        };

        this.updateTank = function( tankDescriptor ){
            commands.push( {action: updateTankAction, args: [tankDescriptor]} );
        };

        this.teleportFish = function( fish ){
            commands.push( {action: teleportFishAction, args: [fish]} );
        };
    };
} );