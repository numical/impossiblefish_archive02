define( ["app/gui","app/bubble","app/debug"], function( GUI, Bubble, Debug ) {
    'use strict';
    return function(){

        var CONNECTED_BORDER = "dashed ",
            DISCONNECTED_BORDER = "solid ",
            BUBBLE_DENSITY = 30, // width pixels per bubble
            self = this,
            canvas = GUI.getFishTankCanvas(),
            fishies = [],
            bubbles = [],
            animationRequestId = null,

            addBubbles = function() {
                bubbles.splice(0,bubbles.length);
                var numBubbles = self.width/BUBBLE_DENSITY;
                while ( --numBubbles > 0 ) {
                    bubbles.push( new Bubble( self ) );
                }
            },

            resize = function(){
                self.height = canvas.clientHeight;
                self.width = canvas.clientWidth;
                canvas.height = self.height;
                canvas.width = self.width;
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

        this.init = function() {
            // set up dynamic sizing
            var window = GUI.getWindow();
            window.addEventListener('resize', resize, false);
            window.addEventListener('orientationchange', resize, false);

            // size and start animation
            resize();
            addBubbles();
            animate();
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
            Debug.log( "Fish '" + fish.getDescriptor().meme + "' added, total fishies = " + fishies.length );
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
                Debug.logWithStackTrace( "Fish '" + removed.getDescriptor().meme + "' removed, total fishies = " + fishies.length );
            }
        };
    };
});




