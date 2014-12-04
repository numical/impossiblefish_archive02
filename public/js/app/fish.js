define( ["app/commands", "app/fishtank","app/gui","app/util","app/debug"], function(
    CommandQueue, FishTank, GUI, Util, Debug ) {
    'use strict';
    // constants
    var FISH_DIMENSION = 10,
        FISH_AGILITY = 10,      // max change of direction (+/-) in degrees
        FISH_TWITCHINESS = 10,  // how frequently change direction - 1 in N times
        FISH_SPEED = 2,
        HEAD = {
            COLOUR: "#F9CD1B",
            ORIGIN: 0,
            RADIUS: FISH_DIMENSION,
            START_ANGLE: 11 * Math.PI / 6,
            END_ANGLE: Math.PI / 6
        },
        TAIL = {
            ORIGIN: 0,
            LENGTH: FISH_DIMENSION * 2,
            HEIGHT: FISH_DIMENSION
        },
        EYE = {
            COLOUR: "#000",
            ORIGIN: -FISH_DIMENSION / 2,
            RADIUS: FISH_DIMENSION / 8,
            START_ANGLE: 0,
            END_ANGLE: 2 * Math.PI
        },
        BOUNDS = {
            X: -FISH_DIMENSION - 1,  // note 1 pixel 'border' to avoid 'smudging'
            Y: -FISH_DIMENSION - 1,
            WIDTH: 3 * FISH_DIMENSION + 2,
            HEIGHT: 2 * FISH_DIMENSION + 2
        };

    // encapsulate the drawing logic of the fish
    function FishImage() {

        var xPos, yPos, rotationRadians, context = GUI.getFishTankContext();

        this.setPosition = function (x, y, rotation) {
            xPos = x;
            yPos = y;
            rotationRadians = rotation;
        };

        this.draw = function () {
            context.translate(xPos, yPos);
            context.rotate(rotationRadians);

            context.fillStyle = HEAD.COLOUR;
            context.beginPath();
            context.moveTo(TAIL.ORIGIN, TAIL.ORIGIN);
            context.lineTo(TAIL.LENGTH, -TAIL.HEIGHT);
            context.lineTo(TAIL.LENGTH, TAIL.HEIGHT);
            context.lineTo(TAIL.ORIGIN, TAIL.ORIGIN);
            context.arc(HEAD.ORIGIN, HEAD.ORIGIN, HEAD.RADIUS, HEAD.START_ANGLE, HEAD.END_ANGLE, true);
            context.fill();

            context.fillStyle = EYE.COLOUR;
            context.beginPath();
            context.arc(EYE.ORIGIN, EYE.ORIGIN, EYE.RADIUS, EYE.START_ANGLE, EYE.END_ANGLE, true);
            context.fill();

            context.rotate(-rotationRadians);
            context.translate(-xPos, -yPos);
        };

        this.hide = function () {
            context.translate(xPos, yPos);
            context.rotate(rotationRadians);
            context.clearRect(BOUNDS.X, BOUNDS.Y, BOUNDS.WIDTH, BOUNDS.HEIGHT);
            context.rotate(-rotationRadians);
            context.translate(-xPos, -yPos);
        };
    }

    // the main fish object defining behaviour
    return function ( fishdescriptor ) {

        var self = this,
            xPos = FishTank.width * fishdescriptor.xRelative,
            yPos = FishTank.height * fishdescriptor.yRelative,
            rotationInRadians = fishdescriptor.rotation,
            hidden = false,
            image = new FishImage(),

            recalculatePosition = function () {

                if (Util.random(0, FISH_TWITCHINESS) < 1) {
                    rotationInRadians += Util.random(-FISH_AGILITY, FISH_AGILITY) * Math.PI / 180;
                }

                xPos -= FISH_SPEED * Math.cos(rotationInRadians);
                yPos -= FISH_SPEED * Math.sin(rotationInRadians);


                if (xPos < 1) {
                    if (FishTank.left) {
                        self.hide();
                        xPos = 0;
                        CommandQueue.teleportFish(self);
                    } else {
                        xPos = FishTank.width - 1;
                    }
                } else if (xPos >= FishTank.width) {
                    if (FishTank.right) {
                        self.hide();
                        xPos = FishTank.width;
                        CommandQueue.teleportFish(self);
                    } else {
                        xPos = 0;
                    }
                } else if (yPos < 1) {
                    if (FishTank.top) {
                        self.hide();
                        yPos = 0;
                        CommandQueue.teleportFish(self);
                    } else {
                        yPos = FishTank.height - 1;
                    }
                } else if (yPos >= FishTank.height) {
                    if (FishTank.bottom) {
                        self.hide();
                        yPos = FishTank.height;
                        CommandQueue.teleportFish(self);
                    } else {
                        yPos = 1;
                    }

                }
            };


        this.animate = function () {
            if (!hidden) {
                image.hide();
                image.setPosition(xPos, yPos, rotationInRadians);
                image.draw();
                recalculatePosition();
            }
        };

        this.hide = function () {
            if ( !hidden ) {
                hidden = true;
                image.hide();
                if ( Debug ) {
                    Debug.logWithStackTrace( "Fish '" + fishdescriptor.meme + "' hidden" );
                }
            }
        };

        this.show = function() {
            hidden = false;
        };

        this.getDescriptor = function(){
            fishdescriptor.xRelative =  xPos/FishTank.width;
            fishdescriptor.yRelative = yPos/FishTank.height;
            fishdescriptor.rotation = rotationInRadians;
            return fishdescriptor;
        };

        image.setPosition( xPos, yPos, rotationInRadians);
    };
});







