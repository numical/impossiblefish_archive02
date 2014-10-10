/*
ImpossibleFish has 2 core models on the client side -  Fishtank and Fish.
This script comprises the Fishtank.
*/

// Fishtank module requires the Fish module
define(["fish"],function(Fish){

    return function( context, bounds ){

        var fishies = [],
            animationRequestId,


            populate = function() {
                // will add bubbles here!
            },

            animate = function(){
                fishies.forEach( function( fish ){
                    fish.animate();
                } );
                animationRequestId = requestAnimationFrame( animate, context.canvas );
            },

            pause = function() {
                cancelAnimationFrame(animationRequestId);
                animationRequestId = null;
            };

        this.togglePause = function(){
            if (animationRequestId) {
                pause();
            } else {
                animate();
            }
        };

        this.addFish = function(){
            fishies.push( new Fish( context, bounds ) );
            if ( fishies.length === 1 ) {
                animate();
            }
        };

        this.removeFish = function( fish ){
            var removed = fishies.pop();
            if ( removed ) {
                removed.hide();
                if ( fishies.length === 0 ) {
                    pause();
                }
            }
        };

        this.connectToServer = function() {
            return true;
        }

        this.disconnectFromServer = function() {
            return true;
        }

        // start-up
        populate();
    }
});




