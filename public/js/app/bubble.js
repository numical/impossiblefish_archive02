define( ["app/gui", "app/util"], function( GUI, Util ){
    'use strict';

    var MAX_BUBBLE_RADIUS = 10,
        BORDER_COLOUR = "black",
        BUBBLE_COLOUR = "white",
        context = GUI.getFishTankContext(),

        calculateRandomX = function( tankWidth ) {
            return Math.floor(  Util.random( MAX_BUBBLE_RADIUS, tankWidth - MAX_BUBBLE_RADIUS ) );
        },

        draw = function( bubble ){
            context.beginPath();
            context.arc( 0, 0, bubble.bubbleRadius, 0, Math.PI * 2, true );
            context.strokeStyle = BORDER_COLOUR;
            context.stroke();
            context.fillStyle = BUBBLE_COLOUR;
            context.fill();
        },

        hide = function( bubble ){
            context.clearRect(
                -bubble.imageRadius,
                -bubble.imageRadius + bubble.speed,
                bubble.imageRadius * 2,
                bubble.imageRadius * 2 );
        },

        recalculatePositionOf = function( bubble ){
            bubble.coords.y -= bubble.speed;
            if( bubble.coords.y < -bubble.imageRadius ){
                bubble.coords.y = bubble.parentTank.height;
                bubble.coords.x = calculateRandomX( bubble.parentTank.width );
            }
        },

        animate = function( bubble ){
            if( bubble.delay === 0 ){
                context.translate( bubble.coords.x, bubble.coords.y );
                hide( bubble );
                draw( bubble );
                context.translate( -bubble.coords.x, -bubble.coords.y );
                recalculatePositionOf( bubble );
            } else{
                --bubble.delay;
            }
        },

        Bubble = function( FishTank ){
            this.parentTank = FishTank;
            this.bubbleRadius = Util.random( 2, MAX_BUBBLE_RADIUS );
            this.imageRadius = this.bubbleRadius + context.lineWidth;
            this.coords = {
                x: calculateRandomX ( FishTank.width - MAX_BUBBLE_RADIUS ),
                y: FishTank.height
            };
            this.speed =  Math.ceil( FishTank.height / 1000 ); // up tank in 20 secs (assuming 50Hz)
            this.delay = Util.random( 0, FishTank.height / this.speed );
        };

    Bubble.prototype.animate = function(){
       animate( this );
    };

    return Bubble;
} );

