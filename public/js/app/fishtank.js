/*
ImpossibleFish has 2 core models on the client side -  Fishtank and Fish.
This script comprises the Fishtank.
*/

// Fishtank module requires the Fish module
define(["app/fishfactory"],function( FishFactory ){

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
            var newFish = FishFactory.createFish( context, bounds );
            console.log( JSON.stringify( newFish, null, 4 ));
            fishies.push( newFish );
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

        // start-up
        populate();
    }
});




