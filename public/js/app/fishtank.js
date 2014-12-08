define( [ "app/fish",  "app/bubble", "app/gui",  "app/debug"],
            function( Fish, Bubble, GUI, Debug ){
    'use strict';
    var CONNECTED_BORDER = "dashed ",
        DISCONNECTED_BORDER = "solid ",
        BUBBLE_DENSITY = 30, // width pixels per bubble
        canvas = GUI.getFishTankCanvas(),
        fishies = [],
        bubbles = [],

        publicContract = {

            height: 300,
            width: 150,
            top: null,
            bottom: null,
            left: null,
            right: null,

            updateConnectedTanks: function( tankDescriptor ){
                publicContract.top = tankDescriptor.top;
                publicContract.bottom = tankDescriptor.bottom;
                publicContract.left = tankDescriptor.left;
                publicContract.right = tankDescriptor.right;

                var style = (tankDescriptor.top) ? CONNECTED_BORDER : DISCONNECTED_BORDER;
                style += (tankDescriptor.right) ? CONNECTED_BORDER : DISCONNECTED_BORDER;
                style += (tankDescriptor.bottom) ? CONNECTED_BORDER : DISCONNECTED_BORDER;
                style += (tankDescriptor.left) ? CONNECTED_BORDER : DISCONNECTED_BORDER;
                canvas.style.borderStyle = style;
            },

            addFish: function( fishDescriptor ){
                var fish = new Fish( fishDescriptor, publicContract );
                fishies.push( fish );
                if ( Debug ){
                    Debug.log( "Fish '" + fish.getDescriptor().meme + "' added, total fishies = " + fishies.length );
                }
            },

            removeFish: function( fish ){
                var removed, index;
                if( fish ){
                    index = fishies.indexOf( fish );
                    if( index > -1 ){
                        removed = fishies.splice( index, 1 )[0];
                    }
                } else{
                    removed = fishies.pop();
                }
                if( removed ){
                    removed.hide();
                    if ( Debug ) {
                        Debug.logWithStackTrace( "Fish '" + removed.getDescriptor().meme + "' removed, total fishies = " + fishies.length );
                    }
                }
            }
        },

        addBubbles = function(){
            bubbles.splice( 0, bubbles.length );
            var numBubbles = publicContract.width / BUBBLE_DENSITY;
            while( --numBubbles > 0 ){
                bubbles.push( new Bubble( publicContract ) );
            }
        },

        resize = function(){
            publicContract.height = canvas.clientHeight;
            publicContract.width = canvas.clientWidth;
            canvas.height = publicContract.height;
            canvas.width = publicContract.width;
        },

        animate = function(){
            fishies.forEach( function( fish ){
                fish.animate();
            } );
            bubbles.forEach( function( bubble ){
                bubble.animate();
            } );
            window.requestAnimationFrame( animate, canvas );
        },

        init = function(){
            // set up dynamic sizing
            var window = GUI.getWindow();
            window.addEventListener( 'resize', resize, false );
            window.addEventListener( 'orientationchange', resize, false );

            // size and start animation
            resize();
            addBubbles();
            animate();
        };

    init();
    return publicContract;
} );




