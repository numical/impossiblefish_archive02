/**
 * Handles all live fish tanks.
 */

/**
 * Constants to ensure strict equalities
 */
var LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down';

/**
 * Records tank data and, recursively, that of neighbours
 */
function FishTankMetadata( socket ){

    this.id = socket.id;
    this[LEFT] = null;
    this[RIGHT] = null;
    this[UP] = null;
    this[DOWN] = null;
    this.x = null;
    this.y = null;
}

/**
 * Central in-memory fishtank repository and manipulation functions
 */
function FishTanks(){

    var tankCount = 0,
        gridSize = 0,
        allTanks = {},
        initialTank = null,

        addInitialTank = function( newTankMetadata ){
            initialTank = newTankMetadata;
            newTankMetadata.x = 0;
            newTankMetadata.y = 0;
            allTanks[ newTankMetadata.id ] = newTankMetadata;
        },

        removeInitialTank = function( tankMetadata ){
            initialTank = null;
            delete allTanks[ tankMetadata.id ];
        },

        addAndLinkToNeighbours = function( newTankMetadata ){
            assert( initialTank );

            var focus = { x: 0, y: 0, tank: initialTank },
                linked = false,
                stepSize = 0;

            while( !linked ){
                stepSize++;
                if( !moveFocus( focus, RIGHT, stepSize ) ){
                    // place to right of focus:
                    addToGrid( newTankMetadata, focus, RIGHT );
                    linked = true;
                } else if( !moveFocus( focus, DOWN, stepSize ) ){
                    // place below focus
                    addToGrid( newTankMetadata, focus, DOWN );
                    linked = true;
                } else if( !moveFocus( focus, LEFT, stepSize ) ){
                    // place to left of focus
                    addToGrid( newTankMetadata, focus, LEFT );
                    linked = true;
                }
                else {
                    assert( moveFocus( focus, UP, stepSize ) );
                    assert( focus.tank === initialTank );
                }
            }

        },

        moveFocus = function( focus, direction, stepSize ){
            var initialTank = focus.tank;
            while( stepSize ){
                if( !focus.tank[direction] ){
                    // no neighbour defined
                    return false;
                }
                if ( focus.tank[direction] === initialTank ) {
                    // have looped around column/row
                    return false;
                }
                focus.tank = focus.tank[direction];
                switch( direction ){
                    case LEFT:
                        focus.x--;
                        break;
                    case RIGHT:
                        focus.x++;
                        break;
                    case UP:
                        focus.y--;
                        break;
                    case DOWN:
                        focus.y++;
                        break;
                }
                stepSize--;
            }
            return true;
        },

        addToGrid = function( newTankMetadata, focus, direction ){

            var oppositeDirection;

            switch( direction ){
                case LEFT:
                    oppositeDirection = RIGHT;
                    newTankMetadata.x = focus.x - 1;
                    newTankMetadata.y = focus.y;
                    break;
                case RIGHT:
                    oppositeDirection = LEFT;
                    newTankMetadata.x = focus.x + 1;
                    newTankMetadata.y = focus.y;
                    break;
                case UP:
                    oppositeDirection = DOWN;
                    newTankMetadata.x = focus.x;
                    newTankMetadata.y = focus.y - 1;
                    break;
                case DOWN:
                    oppositeDirection = UP;
                    newTankMetadata.x = focus.x;
                    newTankMetadata.y = focus.y + 1;
                    break;
            }
            assert( oppositeDirection );

            // if focus has tank(s) to the other side of the add
            if( focus.tank[oppositeDirection] ){
                // put new tank on the correct side
                focus.tank[direction] = newTankMetadata;
                newTankMetadata[oppositeDirection] = focus.tank;
                // find 'last' tank - i.e. the tank that previously connected to focus
                var last = focus.tank;
                while( last[oppositeDirection] !== newTankMetadata[oppositeDirection] ){
                    last = last[oppositeDirection];
                    assert( last );  // no gaps
                }
                last[oppositeDirection] = newTankMetadata;
                newTankMetadata[direction] = last;

            } else{
                // no tanks on the other side of the focus
                // hence focus and new tank are the only tanks on this row/column
                newTankMetadata[oppositeDirection] = focus.tank;
                newTankMetadata[direction] = focus.tank;
                focus.tank[oppositeDirection] = newTankMetadata;
                focus.tank[direction] = newTankMetadata;
            }

            // any connections for orthogonal direction?
            switch ( direction ) {
                case RIGHT:
                    // always be a new column - no existing up and down
                    break;
                case LEFT:
                    // as we are going clockwise, the tank above and to the left of focus (if any )
                    // will become the top of the new tank
                    var above =  focus.tank[UP][LEFT];
                    if ( above ) {
                        newTankMetadata[UP] =  above;
                        // if above is already connected to a tank below it, inject new tank
                        if ( above[DOWN] ) {
                            above[DOWN][UP] = newTankMetadata;
                            newTankMetadata[DOWN] = above[DOWN];
                            above[DOWN] = newTankMetadata;
                        } else {
                            // only above and new tank are in this column so loop
                            newTankMetadata[DOWN] = above;
                            above[DOWN] = newTankMetadata;
                            above[UP] = newTankMetadata;
                        }
                    }
                    break;
                case DOWN:
                    // only do if not a new row
                    if ( newTankMetadata.y + 1 < gridSize ){
                        // as we are going clockwise, the tank to the left and down of the focus (if any )
                        // will become the left of the new tank - unless this is a new row
                        var left = focus.tank[LEFT][DOWN];
                        if( left && ( newTankMetadata.y + 1 < gridSize ) ){
                            newTankMetadata[LEFT] = left;
                            // if left is already connected to a tank to its right, inject new tank
                            if( left[RIGHT] ){
                                left[RIGHT][LEFT] = newTankMetadata;
                                newTankMetadata[RIGHT] = left[RIGHT];
                                left[RIGHT] = newTankMetadata;
                            }
                        }
                    }
                    break;
            }

            // add to grid, record if it has expanded
            allTanks[ newTankMetadata.id ] = newTankMetadata;
            if ( newTankMetadata.x + 1 > gridSize ) {
                gridSize = newTankMetadata.x + 1;
            }

            console.log( "tank %s added at [%d,%d]", newTankMetadata.id, newTankMetadata.x, newTankMetadata.y );
        },

        removeAndUnlinkFromNeighbours = function( tankMetadata ){
            if( tankMetadata[LEFT] ) tankMetadata[LEFT][RIGHT] = null;
            if( tankMetadata[RIGHT] ) tankMetadata[RIGHT][LEFT] = null;
            if( tankMetadata[UP] ) tankMetadata[UP][DOWN] = null;
            if( tankMetadata[DOWN] ) tankMetadata[DOWN][UP] = null;
            delete allTanks[ tankMetadata.id ];
            console.log( "tank %s removed at [%d,%d]", tankMetadata.id, tankMetadata.x, tankMetadata.y );
        };

    this.addFishTank = function( metadata ){
        if( tankCount === 0 ){
            addInitialTank( metadata )
        } else{
            addAndLinkToNeighbours( metadata );
        }
        tankCount++;
    };

    this.removeFishTank = function( metadata ){
        metadata = allTanks[ metadata.id ];
        if( tankCount === 1 ){
            removeInitialTank( metadata );
        } else{
            removeAndUnlinkFromNeighbours( metadata );
        }
        tankCount--;
    };

    this.getFishTankById = function( id ){
        return allTanks[ id ];
    };
}

/**
 * Temporary development debugging
 */
function assert( outcome, msg ){
    msg = msg || 'assertion error';
    if( !outcome ){
        throw new Error( msg );
    }
}

/**
 * Public API
 */
module.exports = function( MessageFactory ){

    var fishTanks = new FishTanks(),

        createDescriptor = function( metadata, MessageFactory ){
            var descriptor = MessageFactory.createFishTankDescriptor(
                metadata.id, metadata.x, metadata.y );
            if( metadata[LEFT] ) descriptor.left = metadata[LEFT].id;
            if( metadata[RIGHT] ) descriptor.right = metadata[RIGHT].id;
            if( metadata[UP] ) descriptor.top = metadata[UP].id;
            if( metadata[DOWN] ) descriptor.bottom = metadata[DOWN].id;
            return descriptor;
        };

    return {
        addFishTankOnSocket: function( socket, callback  ){
            var metadata = new FishTankMetadata( socket );
            fishTanks.addFishTank( metadata );
            if ( callback ) {
                callback( createDescriptor( metadata, MessageFactory ) );
            }
        },

        removeFishTankOnSocket: function( socket ){
            var metadata = new FishTankMetadata( socket );
            fishTanks.removeFishTank( metadata );
        },

        getFishTankDescriptor: function( id ){
            var metadata = fishTanks.getFishTankById( id );
            return metadata ? createDescriptor( metadata, MessageFactory ) : null;
        }
    };
}





