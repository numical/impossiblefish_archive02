/*
 ImpossibleFish has 2 core models on the client side -  Fishtank and Fish.
 This script comprises the Fish.
 */

// Fish module requires the Util module
define(["util"],function(Util) {

    // constants
    var FISH_DIMENSION = 10,
        FISH_AGILITY = 10,      // max change of direction (+/-) in degrees
        FISH_TWITCHINESS = 10,  // how frequently change direction - 1 in N times
        FISH_SPEED = 2,
        HEAD = {
            COLOUR: "#F9CD1B",
            ORIGIN: 0,
            RADIUS: FISH_DIMENSION,
            START_ANGLE: 11*Math.PI/ 6,
            END_ANGLE: Math.PI/ 6
        },
        TAIL = {
            ORIGIN: 0,
            LENGTH: FISH_DIMENSION*2,
            HEIGHT: FISH_DIMENSION
        },
        EYE = {
            COLOUR: "#000",
            ORIGIN: -FISH_DIMENSION/ 2,
            RADIUS: FISH_DIMENSION/ 8,
            START_ANGLE: 0,
            END_ANGLE: 2*Math.PI
        },
        BOUNDS = {
            X: -FISH_DIMENSION - 1,  // note 1 pixel 'border' to avoid 'smudging'
            Y: -FISH_DIMENSION - 1,
            WIDTH: 3*FISH_DIMENSION + 2,
            HEIGHT: 2*FISH_DIMENSION + 2
        };

    // encapsulate the drawing logic of the fish
    function FishImage( context ) {

        var xPos, yPos, rotationRadians;

        this.setPosition = function( x, y, rotation ) {
            xPos = x,
            yPos = y;
            rotationRadians = rotation;
        }

        this.draw = function(){
            context.translate( xPos, yPos );
            context.rotate( rotationRadians );

            context.fillStyle = HEAD.COLOUR;
            context.beginPath();
            context.moveTo( TAIL.ORIGIN, TAIL.ORIGIN );
            context.lineTo( TAIL.LENGTH,  -TAIL.HEIGHT );
            context.lineTo(  TAIL.LENGTH,  TAIL.HEIGHT );
            context.lineTo( TAIL.ORIGIN, TAIL.ORIGIN );
            context.arc( HEAD.ORIGIN, HEAD.ORIGIN, HEAD.RADIUS, HEAD.START_ANGLE, HEAD.END_ANGLE, true  );
            context.fill();

            context.fillStyle = EYE.COLOUR;
            context.beginPath();
            context.arc( EYE.ORIGIN, EYE.ORIGIN, EYE.RADIUS, EYE.START_ANGLE, EYE.END_ANGLE, true  );
            context.fill();

            context.rotate( -rotationRadians );
            context.translate( -xPos, -yPos );
        };

        this.hide = function(){
            context.translate( xPos, yPos );
            context.rotate( rotationRadians );
            context.clearRect( BOUNDS.X, BOUNDS.Y, BOUNDS.WIDTH, BOUNDS.HEIGHT );
            context.rotate( -rotationRadians );
            context.translate( -xPos, -yPos );
        };
    }

    // the fish object itself
    return function (context, bounds) {

        var xPos = Util.random(0, bounds.width),
            yPos = Util.random(0, bounds.height),
            rotationInRadians = Util.random(0, 2 * Math.PI),
            hidden = false,
            image = new FishImage(context),

            recalculatePosition = function () {

                if (Util.random(0, FISH_TWITCHINESS) < 1) {
                    rotationInRadians += Util.random(-FISH_AGILITY, FISH_AGILITY) * Math.PI / 180;
                }

                xPos -= FISH_SPEED * Math.cos(rotationInRadians);
                yPos -= FISH_SPEED * Math.sin(rotationInRadians);

                if (xPos < 1) {
                    xPos = bounds.width - 1;
                } else if (xPos >= bounds.width) {
                    xPos = 0;
                }

                yPos--;
                if (yPos < 1) {
                    yPos = bounds.height - 1;
                } else if (yPos >= bounds.height) {
                    yPos = 1;
                }
            };

        this.animate = function () {
            if (!hidden) {
                image.hide();
                image.setPosition(xPos, yPos, rotationInRadians);
                image.draw();
                recalculatePosition();
            }
        }

        this.hide = function () {
            hidden = true;
            image.hide();
        }

        image.setPosition( xPos, yPos, rotationInRadians );
    }
});







