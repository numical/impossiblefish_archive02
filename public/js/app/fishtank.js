define( ["app/bubble"], function( Bubble ) {
    'use strict';
    return function( canvas, debug ){

        var CONNECTED_BORDER = "dashed ",
            DISCONNECTED_BORDER = "solid ",
            BUBBLE_DENSITY = 30, // width pixels per bubble
            self = this,
            fishies = [],
            bubbles = [],
            animationRequestId = null,

            addBubbles = function() {
                bubbles.splice(0,bubbles.length);
                var numBubbles = self.width/BUBBLE_DENSITY,
                    guiContext = canvas.getContext("2d");
                while ( --numBubbles > 0 ) {
                    bubbles.push( new Bubble( guiContext, self ) );
                }
            },

            animate = function(){
                fishies.forEach( function( fish ){
                    fish.animate();
                } );
                bubbles.forEach( function( bubble ){
                    bubble.animate();
                });
                animationRequestId = window.requestAnimationFrame( animate, canvas );
            },

            pause = function() {
                window.cancelAnimationFrame(animationRequestId);
                animationRequestId = null;
            };

        this.height = 300;
        this.width = 150;
        this.top = null;
        this.bottom = null;
        this.left = null;
        this.right = null;

        this.togglePause = function(){
            if (animationRequestId) {
                pause();
            } else {
                animate();
            }
        };

        this.updateConnectedTanks = function( tankDescriptor ) {
            this.top = tankDescriptor.top;
            this.bottom = tankDescriptor.bottom;
            this.left = tankDescriptor.left;
            this.right = tankDescriptor.right;

            var style = (tankDescriptor.top)  ? CONNECTED_BORDER : DISCONNECTED_BORDER;
            style += (tankDescriptor.right) ? CONNECTED_BORDER : DISCONNECTED_BORDER;
            style += (tankDescriptor.bottom)  ? CONNECTED_BORDER : DISCONNECTED_BORDER;
            style += (tankDescriptor.left)  ? CONNECTED_BORDER : DISCONNECTED_BORDER;
            canvas.style.borderStyle = style;
        };

        this.addFish = function( fish ){
            fishies.push( fish );
            if ( fishies.length === 1 ) {
                animate();
            }
            if ( debug ) {
                debug.log( "Fish '" + fish.getDescriptor().meme + "' added, total fishies = " + fishies.length );
            }
        };

        this.removeFish = function( fish ){
            var removed, index;
            if ( fish ) {
                index = fishies.indexOf( fish );
                if ( index > -1 ) {
                    removed = fishies.splice( index, 1 )[0];
                }
            } else {
                removed = fishies.pop();
            }
            if ( removed ) {
                removed.hide();
                if ( fishies.length === 0 ) {
                    pause();
                }
                if ( debug ) {
                    debug.logWithStackTrace( "Fish '" + removed.getDescriptor().meme + "' removed, total fishies = " + fishies.length );
                }
            }
        };

        // dynamic sizing of canvas and fish tank
        this.resize = function(){
            self.height = canvas.clientHeight;
            self.width =  canvas.clientWidth;
            canvas.height = self.height;
            canvas.width = self.width;
            addBubbles();
        };
    };
});




