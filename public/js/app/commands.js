define(["app/fish","app/messages","app/util"], function( Fish, Messages, Util ) {

    var
        self = this,
        commands = [],
        fishtank = null,
        socketwrapper = null,
        guiContext = null,

        processCommands = function () {
            setTimeout(function () {
                if (commands.length > 0) {
                    var command = commands.shift();
                    command.action.apply(self, command.args);
                }
                processCommands();
            }, 100);
        },

        connectToServerAction = function () {
            socketwrapper.connectToServer();
        },

        addFishAction = function ( fishDescriptor ) {
            if ( !fishDescriptor ) {
                fishDescriptor = new Messages.FishDescriptor( 0.5, 0.5, Util.random(0, 2 * Math.PI));
            }
            var fish = new Fish( publicContract, guiContext, fishtank, fishDescriptor );
            fishtank.addFish(fish);
        },

        teleportFishAction = function (fish) {
            if (socketwrapper.teleportFish(fish)) {
                fishtank.removeFish();
            } else {
                fish.show();
            }
        },

        updateTankAction = function (tankDescriptor) {
            fishtank.updateConnectedTanks(tankDescriptor);
        },

        publicContract = {

            init: function (fishTank, socketWrapper, canvas ) {
                fishtank = fishTank;
                socketwrapper = socketWrapper;
                guiContext = canvas.getContext("2d");
                processCommands();
            },

            connectToServer: function () {
                commands.push({action: connectToServerAction});
            },

            addFish: function ( fishDescriptor) {
                commands.push({action: addFishAction, args: [fishDescriptor]} );
            },

            updateTank: function (tankDescriptor) {
                commands.push({action: updateTankAction, args: [tankDescriptor]});
            },

            teleportFish: function (fish) {
                commands.push({action: teleportFishAction, args: [fish]});
            }
        };

    return publicContract;
});