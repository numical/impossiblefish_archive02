define( ["app/util"], function (Util) {

    var MAX_BUBBLE_RADIUS = 10,
        BORDER_COLOUR = "black",
        BUBBLE_COLOUR = "white",
        MIN_SPEED = 0.3,
        MAX_SPEED = 0.7;


    return function (context, fishtank) {

        var self = this,
            bubbleRadius = Util.random(2, MAX_BUBBLE_RADIUS),
            imageRadius = bubbleRadius + context.lineWidth,
            xPos = Util.random(MAX_BUBBLE_RADIUS, fishtank.width - MAX_BUBBLE_RADIUS),
            yPos = fishtank.height,
            speed = 0.5, // Util.random( MIN_SPEED, MAX_SPEED ),
            delay = Util.random( 0, fishtank.height/speed ),

            draw = function () {
                context.translate(xPos, yPos);
                context.beginPath();
                context.arc(0, 0, bubbleRadius, 0, Math.PI * 2, true);
                context.strokeStyle = BORDER_COLOUR,
                context.stroke();
                context.fillStyle = BUBBLE_COLOUR;
                context.fill();
                context.translate(-xPos, -yPos);
            },

            hide = function () {
                context.translate(xPos, yPos);
                context.clearRect(-imageRadius, -imageRadius+1, imageRadius*2, imageRadius*2 );
                context.translate(-xPos, -yPos);
            },

            recalculatePosition = function () {
                yPos -= speed;
                if ( yPos <= -imageRadius ) {
                    yPos = fishtank.height;
                    xPos = Util.random(MAX_BUBBLE_RADIUS, fishtank.width - MAX_BUBBLE_RADIUS);
                }
            }

        this.animate = function () {
            if ( delay === 0 ) {
                hide();
                draw();
                recalculatePosition();
            } else {
                delay--;
            }

        }
    }
}) ;
