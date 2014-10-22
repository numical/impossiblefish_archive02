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

    this.id = socket ? socket.id : null;
    this[LEFT] = null;
    this[RIGHT] = null;
    this[UP] = null;
    this[DOWN] = null;
    this.x = null;
    this.y = null;

    this.clone = function(){
        var clone = new FishTankMetadata();
        clone.id = this.id;
        clone[LEFT] = this[LEFT];
        clone[RIGHT] = this[RIGHT];
        clone[UP] = this[UP];
        clone[DOWN] = this[DOWN];
        clone.x = this.x;
        clone.y = this.y;
        return clone;
    }
}

/**
 * Central in-memory fishtank repository and manipulation functions
 */
function FishTanks(){

    var metadata = {
            tankCount: 0,
            gridSize: 0
        },
        initialTank = null,
        tanks = {},

        addInitialTank = function( newTankMetadata ){
            initialTank = newTankMetadata;
            newTankMetadata.x = 0;
            newTankMetadata.y = 0;
            tanks[ newTankMetadata.id ] = newTankMetadata;
            metadata.tankCount = 1;
            metadata.gridSize = 1;
        },

        removeInitialTank = function( tankMetadata ){
            initialTank = null;
            delete tanks[ tankMetadata.id ];
            metadata.tankCount = 0;
            metadata.gridSize = 0;
        },

        addAndLinkToNeighbours = function( tankMetadata, isExistingTank ){
            assert( initialTank );

            // find first gap in grid without a tank
            var focus = { x: 0, y: 0, tank: initialTank },
                added = false,
                stepSize = 0;
            while( !added ){
                stepSize++;
                if( !moveFocus( focus, RIGHT, stepSize ) ){
                    // place to right of focus:
                    addToGrid( tankMetadata, focus, RIGHT, isExistingTank );
                    added = true;
                } else if( !moveFocus( focus, DOWN, stepSize ) ){
                    // place below focus
                    addToGrid( tankMetadata, focus, DOWN, isExistingTank );
                    added = true;
                } else if( !moveFocus( focus, LEFT, stepSize ) ){
                    // place to left of focus
                    addToGrid( tankMetadata, focus, LEFT, isExistingTank );
                    added = true;
                }
                else {
                    var moveUp = moveFocus( focus, UP, stepSize );
                    assert( moveUp );
                    assert( focus.tank === initialTank );
                }
            }

        },

        moveFocus = function( focus, direction, stepSize ){
            var startOfMove = focus.tank;
            while( stepSize ){
                var potentialNewFocusTank = focus.tank[direction];
                if( !potentialNewFocusTank ){
                    // no neighbour defined
                    return false;
                }
                if ( potentialNewFocusTank === startOfMove ) {
                    // have looped around column/row
                    return false;
                }
                switch( direction ){
                    case LEFT:
                        if ( potentialNewFocusTank.x !== focus.x - 1 ) {
                            // have found hole in grid
                            return false;
                        } else {
                            focus.x--;
                            break;
                        }
                    case RIGHT:
                        if ( potentialNewFocusTank.x !== focus.x + 1) {
                            // have found hole in grid
                            return false;
                        } else {
                            focus.x++;
                            break;
                        }
                    case UP:
                        if ( potentialNewFocusTank.y!== focus.y - 1 ) {
                            // have found hole in grid
                            return false;
                        } else {
                            focus.y--;
                            break;
                        }
                    case DOWN:
                        if ( potentialNewFocusTank.y!== focus.y + 1 ) {
                            // have found hole in grid
                            return false;
                        } else {
                            focus.y++;
                            break;
                        }
                }
                focus.tank = potentialNewFocusTank;
                stepSize--;
            }
            return true;
        },

        addToGrid = function( newTankMetadata, focus, direction, isExistingTank ){

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
                    if ( newTankMetadata.y + 1 < metadata.gridSize ){
                        // as we are going clockwise, the tank to the left and down of the focus (if any )
                        // will become the left of the new tank - unless this is a new row
                        var left = focus.tank[LEFT][DOWN];
                        if( left && ( newTankMetadata.y + 1 < metadata.gridSize ) ){
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

            if ( !isExistingTank ) {
                // add to grid
                tanks[ newTankMetadata.id ] = newTankMetadata;

                // update metadata
                metadata.tankCount++;
                if ( newTankMetadata.x + 1 > metadata.gridSize ) {
                    metadata.gridSize = newTankMetadata.x + 1;
                }

                // console.log( "tank %s added at [%d,%d]", newTankMetadata.id, newTankMetadata.x, newTankMetadata.y );
            }
        },

        removeAndRelinkNeighbours = function( tankMetadata ){

            var left = null,
                up = null;

            // ensure there is always an initial tank
            if ( tankMetadata === initialTank ){
                var neighbour = ( tankMetadata[RIGHT] ) ? tankMetadata[RIGHT] : tankMetadata[DOWN];
                swapTanks( tankMetadata, neighbour );
                initialTank = neighbour;
            }



            // connect left and right neighbours
            left = tankMetadata[LEFT];
            if( left  ) {
                // unless if left and right neighbours are same, then a single tank on row
                if ( left === tankMetadata[RIGHT] ) {
                    left[RIGHT] = null;
                    left[LEFT] = null;
                    // an orphan and not initial ? re-add to grid
                    if ( !left[UP] && left !==  initialTank ) {
                        addAndLinkToNeighbours( left, true );
                    }
                } else {
                    left[RIGHT] = tankMetadata[RIGHT];
                    tankMetadata[RIGHT][LEFT] = left;
                }
            }

            // connect up and down neighbours
            up =  tankMetadata[UP];
            if( up ) {
                // unless if up and down neighbours are same, then a single tank on column
                if ( up === tankMetadata[DOWN ] ) {
                    up[DOWN] = null;
                    up[UP] = null;
                    // an orphan? re-add to grid
                    if ( !up[LEFT] && up !==  initialTank ) {
                        addAndLinkToNeighbours( up, true );
                    }
                } else {
                    up[DOWN] = tankMetadata[DOWN];
                    tankMetadata[DOWN][UP] = up;
                }
            }

            // remove tank
            delete tanks[ tankMetadata.id ];

            // update metadata
            metadata.tankCount--;
            if ( metadata.tankCount === 1 ) {
                metadata.gridSize = 1;
            } else if( tankMetadata.x === 0 && tankMetadata.y + 1 === metadata.gridSize && !tankMetadata[LEFT] ){
                // removed last tank in a row
                metadata.gridSize--
            }

            // console.log( "tank %s removed at [%d,%d]", tankMetadata.id, tankMetadata.x, tankMetadata.y );
        },

        swapTanks = function( first, second ){

            var firstClone = first.clone(),
                secondClone = second.clone();

            if( second[UP] ) second[UP][DOWN] = first;
            if( second[DOWN]) second[DOWN][UP] = first;
            if( second[LEFT] ) second[LEFT][RIGHT] = first;
            if( second[RIGHT] ) second[RIGHT][LEFT] = first;

            if( first[UP] ) first[UP][DOWN] = second;
            if( first[DOWN]) first[DOWN][UP] = second;
            if( first[LEFT] ) first[LEFT][RIGHT] = second;
            if( first[RIGHT] ) first[RIGHT][LEFT] = second;


            if ( firstClone[RIGHT] === second ) {
                first[LEFT] = second;
                second[RIGHT] = first;
            } else {
                second[RIGHT] = firstClone[RIGHT];
            }

            if ( firstClone[LEFT] === second ) {
                first[RIGHT] = second;
                second[LEFT] = first;
            } else {
                second[LEFT] = firstClone[LEFT];
            }

            if ( firstClone[UP] === second ) {
                first[DOWN] = second;
                second[UP] = first;
            } else {
                second[UP] = firstClone[UP];
            }

            if ( firstClone[DOWN] === second ) {
                first[UP] = second;
                second[DOWN] = first;
            } else {
                second[DOWN] = firstClone[DOWN];
            }

            if ( secondClone[RIGHT] === first ) {
                second[LEFT] = first;
                first[RIGHT] = second;
            } else {
                first[RIGHT] = secondClone[RIGHT];
            }

            if ( secondClone[LEFT] === first ) {
                second[RIGHT] = first;
                first[LEFT] = second;
            } else {
                first[LEFT] = secondClone[LEFT];
            }

            if ( secondClone[UP] === first ) {
                second[UP] = first;
                first[DOWN] = second;
            } else {
                first[UP] = secondClone[UP];
            }

            if ( secondClone[DOWN] === first ) {
                second[UP] = first;
                first[DOWN] = second;
            } else {
                first[DOWN] = secondClone[DOWN];
            }

            first.x = secondClone.x;
            first.y = secondClone.y;
            second.x = firstClone.x;
            second.y = firstClone.y;
        };

    this.addFishTank = function( tankMetadata ){
        if( metadata.tankCount === 0 ){
            addInitialTank( tankMetadata )
        } else{
            addAndLinkToNeighbours( tankMetadata );
        }
    };

    this.removeFishTank = function( tankMetadata ){
        tankMetadata = tanks[ tankMetadata.id ];
        if( metadata.tankCount === 1 ){
            removeInitialTank( tankMetadata );
        } else{
            removeAndRelinkNeighbours( tankMetadata );
        }
    };

    this.getFishTankById = function( id ){
        return tanks[ id ];
    };

    this.getMetadata = function() {
        return metadata;
    }
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
        addFishTankWithSocket: function( socket, callback  ){
            var metadata = new FishTankMetadata( socket );
            fishTanks.addFishTank( metadata );
            if ( callback ) {
                callback( createDescriptor( metadata, MessageFactory ) );
            }
        },

        removeFishTankWithSocket: function( socket, callback ){
            var metadata = new FishTankMetadata( socket );
            fishTanks.removeFishTank( metadata );
            if ( callback ) {
                callback();
            }
        },

        describeFishTankWithId: function( id ){
            var metadata = fishTanks.getFishTankById( id );
            return metadata ? createDescriptor( metadata, MessageFactory ) : null;
        },

        describe: function() {
           return fishTanks.getMetadata();
        }
    };
};





