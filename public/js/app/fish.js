define( ["app/commands", "app/fishtank", "app/gui", "app/util", "app/debug"], function( CommandQueue, FishTank, GUI, Util, Debug ){
    'use strict';
    // constants
    var FISH_DIMENSION = 10,
        FISH_AGILITY = 10,      // max change of direction (+/-) in degrees
        FISH_TWITCHINESS = 10,  // how frequently change direction - 1 in N times
        FISH_SPEED = FishTank.width/400,  // across screen in 10 secs (assuming 50Hz)
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
        },
        context = GUI.getFishTankContext();

    // encapsulate the drawing logic of the fish
    function FishImage( x, y, rotation ){
        this.coords = { x: x, y: y };
        this.rotationInRadians = rotation;
    }

    FishImage.prototype = {

        draw: function(){
            context.translate( this.coords.x, this.coords.y );
            context.rotate( this.rotationInRadians );

            context.fillStyle = HEAD.COLOUR;
            context.beginPath();
            context.moveTo( TAIL.ORIGIN, TAIL.ORIGIN );
            context.lineTo( TAIL.LENGTH, -TAIL.HEIGHT );
            context.lineTo( TAIL.LENGTH, TAIL.HEIGHT );
            context.lineTo( TAIL.ORIGIN, TAIL.ORIGIN );
            context.arc( HEAD.ORIGIN, HEAD.ORIGIN, HEAD.RADIUS, HEAD.START_ANGLE, HEAD.END_ANGLE, true );
            context.fill();

            context.fillStyle = EYE.COLOUR;
            context.beginPath();
            context.arc( EYE.ORIGIN, EYE.ORIGIN, EYE.RADIUS, EYE.START_ANGLE, EYE.END_ANGLE, true );
            context.fill();

            context.rotate(  -this.rotationInRadians );
            context.translate( -this.coords.x, -this.coords.y );
        },

        hide: function(){
            context.translate( this.coords.x, this.coords.y );
            context.rotate( this.rotationInRadians );

            context.clearRect( BOUNDS.X, BOUNDS.Y, BOUNDS.WIDTH, BOUNDS.HEIGHT );

            context.rotate(  -this.rotationInRadians );
            context.translate( -this.coords.x, -this.coords.y );
        }
    };

    // the main fish object defining behaviour
    function Fish( fishdescriptor ){

        this.descriptor = fishdescriptor;
        this.image = new FishImage(
            FishTank.width * fishdescriptor.xRelative,
            FishTank.height * fishdescriptor.yRelative,
            fishdescriptor.rotation );
        this.hidden = false;
    }

    Fish.prototype = {

        recalculatePosition: function(){
            var coords = this.image.coords;
            if( Util.random( 0, FISH_TWITCHINESS ) < 1 ){
                this.image.rotationInRadians += Util.random( -FISH_AGILITY, FISH_AGILITY ) * Math.PI / 180;
            }

            coords.x -= Math.round(FISH_SPEED * Math.cos( this.image.rotationInRadians ));
            coords.y -= Math.floor(FISH_SPEED * Math.sin( this.image.rotationInRadians ));

            if( coords.x < 1 ){
                if( FishTank.left ){
                    this.hide();
                    coords.x = 0;
                    CommandQueue.teleportFish( this );
                } else{
                    coords.x = FishTank.width - 1;
                }
            } else if( coords.x >= FishTank.width ){
                if( FishTank.right ){
                    this.hide();
                    coords.x = FishTank.width;
                    CommandQueue.teleportFish( this );
                } else{
                    coords.x = 0;
                }
            } else if( coords.y < 1 ){
                if( FishTank.top ){
                    this.hide();
                    coords.y = 0;
                    CommandQueue.teleportFish( this );
                } else{
                    coords.y = FishTank.height - 1;
                }
            } else if( coords.y >= FishTank.height ){
                if( FishTank.bottom ){
                    this.hide();
                    coords.y = FishTank.height;
                    CommandQueue.teleportFish( this );
                } else{
                    coords.y = 1;
                }

            }
        },

        animate: function(){
            if( !this.hidden ){
                this.image.hide();
                this.recalculatePosition();
                this.image.draw();
            }
        },

        hide: function(){
            if( !this.hidden ){
                this.hidden = true;
                this.image.hide();
                if( Debug ){
                    Debug.logWithStackTrace( "Fish '" + this.descriptor.meme + "' hidden" );
                }
            }
        },

        show: function(){
            this.hidden = false;
        },

        getDescriptor: function(){
            var descriptor = this.descriptor,
                coords = this.image.coords;
            descriptor.xRelative = coords.x / FishTank.width;
            descriptor.yRelative = coords.y / FishTank.height;
            descriptor.rotation = this.image.rotationInRadians;
            return descriptor;
        }
    };

    return Fish;
} );







