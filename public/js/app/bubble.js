define( ["app/gui", "app/util"], function( GUI, Util ){
    'use strict';

    var MAX_BUBBLE_RADIUS = 10,
        BORDER_COLOUR = "black",
        BUBBLE_COLOUR = "white",
        context = GUI.getFishTankContext(),

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
                -bubble.imageRadius + 1,
                bubble.imageRadius * 2,
                bubble.imageRadius * 2 );
        },

        recalculatePositionOf = function( bubble ){
            bubble.pos.y -= bubble.speed;
            if( bubble.pos.y <= -bubble.imageRadius ){
                bubble.pos.y = bubble.parentTank.height;
                bubble.pos.x = Util.random( MAX_BUBBLE_RADIUS, bubble.parentTank.width - MAX_BUBBLE_RADIUS );
            }
        },

        animate = function( bubble ){
            if( bubble.delay === 0 ){
                context.translate( bubble.pos.x, bubble.pos.y );
                hide( bubble );
                draw( bubble );
                context.translate( -bubble.pos.x, -bubble.pos.y );
                recalculatePositionOf( bubble );
            } else{
                --bubble.delay;
            }
        },

        Bubble = function( FishTank ){
            this.parentTank = FishTank;
            this.bubbleRadius = Util.random( 2, MAX_BUBBLE_RADIUS );
            this.imageRadius = this.bubbleRadius + context.lineWidth;
            this.pos = {
                x: Util.random( MAX_BUBBLE_RADIUS, FishTank.width - MAX_BUBBLE_RADIUS ),
                y: FishTank.height
            };
            this.speed = 0.5;
            this.delay = Util.random( 0, FishTank.height / this.speed );
        };

    Bubble.prototype.animate = function(){
       animate( this );
    };

    return Bubble;
} );

