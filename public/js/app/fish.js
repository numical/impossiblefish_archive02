define( ["app/commands", "app/gui", "app/util", "app/debug"],
        function( CommandQueue, GUI, Util, Debug ){
    'use strict';
    // constants
    var FISH_DIMENSION = 10,
        FISH_AGILITY = 10,      // max change of direction (+/-) in degrees
        FISH_TWITCHINESS = 10,  // how frequently change direction - 1 in N times
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
            context.save();
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

            context.restore();
        },

        hide: function(){
            context.save();
            context.translate( this.coords.x, this.coords.y );
            context.rotate( this.rotationInRadians );

            context.clearRect( BOUNDS.X, BOUNDS.Y, BOUNDS.WIDTH, BOUNDS.HEIGHT );

            context.restore();
        }
    };

    // the main fish object defining behaviour
    function Fish( fishdescriptor, fishtank ){

        this.descriptor = fishdescriptor;
        this.parent = fishtank;
        this.image = new FishImage(
            fishtank.width * fishdescriptor.xRelative,
            fishtank.height * fishdescriptor.yRelative,
            fishdescriptor.rotation );
        this.speed = fishtank.width/400;  // across screen in 10 secs (assuming 50Hz)
        this.hidden = false;
    }

    Fish.prototype = {

        moveOrTeleport: function(){
            var coords = this.image.coords,
                tank = this.parent,
                teleport = false;
            if( Util.random( 0, FISH_TWITCHINESS ) < 1 ){
                this.image.rotationInRadians += Util.random( -FISH_AGILITY, FISH_AGILITY ) * Math.PI / 180;
            }

            coords.x -= Math.floor( this.speed * Math.cos( this.image.rotationInRadians ));
            coords.y -= Math.floor( this.speed * Math.sin( this.image.rotationInRadians ));

            if( coords.x < 1 ){
                if( tank.left ){
                    coords.x = 0;
                    teleport = true;
                } else{
                    coords.x = tank.width - 1;
                }
            } else if( coords.x >= tank.width ){
                if( tank.right ){
                    coords.x = tank.width;
                    teleport = true;
                } else{
                    coords.x = 0;
                }
            } else if( coords.y < 1 ){
                if( tank.top ){
                    coords.y = 0;
                    teleport = true;
                } else{
                    coords.y = tank.height - 1;
                }
            } else if( coords.y >= tank.height ){
                if( tank.bottom ){
                    coords.y = tank.height;
                    teleport = true;
                } else{
                    coords.y = 1;
                }
            }

            if ( teleport ) {
                CommandQueue.teleportFish( this );
            }
            return !teleport;
        },

        animate: function(){
            if( !this.hidden ){
                this.image.hide();
                if ( this.moveOrTeleport() ) {
                    this.image.draw();
                }
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
                coords = this.image.coords,
                tank = this.parent;
            descriptor.xRelative = coords.x / tank.width;
            descriptor.yRelative = coords.y / tank.height;
            descriptor.rotation = this.image.rotationInRadians;
            return descriptor;
        }
    };

    return Fish;
} );







