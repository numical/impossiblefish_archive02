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
 * Records grid data
 */
function GridMetadata( original ){
    this.gridSize = (original) ? original.gridSize : 0;
    this.tankCount = (original) ? original.tankCount : 0;
}

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
 * Operation to insert a tank into an existing grid
 */
function InsertTankOp( tankMetadata, gridMetadata, initialTank ){

    var existingNeighbour = initialTank,
        xInsertCoordinate = 0,
        yInsertCoordinate = 0,
        direction = RIGHT

        findFirstNeighourNextToAnEmptyGridPosition = function(){
            var continueToLoop,
                stepSize = 0;
            do{
                continueToLoop = false;
                stepSize++;
                direction = RIGHT;
                if( changeNeighbour( stepSize ) ){
                    direction = DOWN;
                    if( changeNeighbour( stepSize ) ){
                        direction = LEFT;
                        if( changeNeighbour( stepSize ) ){
                            direction = UP;
                            if( changeNeighbour( stepSize ) ){
                                assert( existingNeighbour === initialTank );
                                continueToLoop = true;
                            } else{
                                assert( false, 'looping around grid has gone wrong' );
                            }
                        }
                    }
                }
            } while( continueToLoop );
        },

        changeNeighbour = function( stepSize ){
            var originalNeighbour = existingNeighbour;
            while( stepSize ){
                var possibleNewNeighbour = existingNeighbour[direction];
                if( !possibleNewNeighbour ){
                    // no neighbour defined
                    return false;
                }
                if( possibleNewNeighbour === originalNeighbour ){
                    // have looped around column/row
                    return false;
                }
                switch( direction ){
                    case LEFT:
                        if( possibleNewNeighbour.x !== xInsertCoordinate - 1 ){
                            //isAGapBetweenExistingTanks = true;
                            return false;
                        } else{
                            xInsertCoordinate--;
                            break;
                        }
                    case RIGHT:
                        if( possibleNewNeighbour.x !== xInsertCoordinate + 1 ){
                            //isAGapBetweenExistingTanks = true;
                            return false;
                        } else{
                            xInsertCoordinate++;
                            break;
                        }
                    case UP:
                        if( possibleNewNeighbour.y !== yInsertCoordinate - 1 ){
                            //isAGapBetweenExistingTanks = true;
                            return false;
                        } else{
                            yInsertCoordinate--;
                            break;
                        }
                    case DOWN:
                        if( possibleNewNeighbour.y !== yInsertCoordinate + 1 ){
                            //isAGapBetweenExistingTanks = true;
                            return false;
                        } else{
                            yInsertCoordinate++;
                            break;
                        }
                }
                existingNeighbour = possibleNewNeighbour;
                stepSize--;
            }
            return true;
        },

        insertNextToNeighbour = function(){
            var oppositeDirection;
            switch( direction ){
                case LEFT:
                    oppositeDirection = RIGHT;
                    xInsertCoordinate--;
                    break;
                case RIGHT:
                    oppositeDirection = LEFT;
                    xInsertCoordinate++;
                    break;
                case UP:
                    oppositeDirection = DOWN;
                    yInsertCoordinate--;
                    break;
                case DOWN:
                    oppositeDirection = UP;
                    yInsertCoordinate++;
                    break;
                default:
                    assert( false, oppositeDirection );
            }
            tankMetadata.x = xInsertCoordinate;
            tankMetadata.y = yInsertCoordinate;

            // if focus has tank(s) to the other side of the add
            if( existingNeighbour[oppositeDirection] ){
                // put new tank on the correct side
                existingNeighbour[direction] = tankMetadata;
                tankMetadata[oppositeDirection] = existingNeighbour;
                // find 'last' tank - i.e. the tank that previously connected to focus
                var last = existingNeighbour;
                while( last[oppositeDirection] !== tankMetadata[oppositeDirection] ){
                    last = last[oppositeDirection];
                    assert( last );  // no gaps
                }
                last[oppositeDirection] = tankMetadata;
                tankMetadata[direction] = last;

            } else{
                // no tanks on the other side of the focus
                // hence focus and new tank are the only tanks on this row/column
                tankMetadata[oppositeDirection] = existingNeighbour;
                tankMetadata[direction] = existingNeighbour;
                existingNeighbour[oppositeDirection] = tankMetadata;
                existingNeighbour[direction] = tankMetadata;
            }

            // any connections for orthogonal direction?
            switch( direction ){
                case RIGHT:
                    // always be on top row
                    var up = (existingNeighbour[UP]) ? existingNeighbour[UP][RIGHT] : null;
                    // if there is an up neighbour that is truly above (i.e not looped)
                    if( up && ( up.x === tankMetadata.x  ) ){
                        tankMetadata[UP] = up;
                        // if up is already connected to a tank to its down, inject new tank
                        if( up[DOWN] ){
                            up[DOWN][UP] = tankMetadata;
                            tankMetadata[DOWN] = up[DOWN];
                            up[DOWN] = tankMetadata;
                        }
                    }
                    break;
                case LEFT:
                    // as we are going clockwise, the tank above and to the left of focus (if any )
                    // will become the top of the new tank
                    var above = existingNeighbour[UP][LEFT];
                    if( above ){
                        tankMetadata[UP] = above;
                        // if above is already connected to a tank below it, inject new tank
                        if( above[DOWN] ){
                            above[DOWN][UP] = tankMetadata;
                            tankMetadata[DOWN] = above[DOWN];
                            above[DOWN] = tankMetadata;
                        } else{
                            // only above and new tank are in this column so loop
                            tankMetadata[DOWN] = above;
                            above[DOWN] = tankMetadata;
                            above[UP] = tankMetadata;
                        }
                    }
                    break;
                case DOWN:
                    // as we are going clockwise, the tank to the left and down of the focus (if any )
                    // will become the left of the new tank - unless this is new row
                    var left = existingNeighbour[LEFT][DOWN];
                    // if there is an left neighbour that is truly left (i.e not looped)
                    if( left && ( left.y === tankMetadata.y  ) ){
                        tankMetadata[LEFT] = left;
                        // if left is already connected to a tank to its right, inject new tank
                        if( left[RIGHT] ){
                            left[RIGHT][LEFT] = tankMetadata;
                            tankMetadata[RIGHT] = left[RIGHT];
                            left[RIGHT] = tankMetadata;
                        }
                    }
                    break;
            }
        },

        isANewRow = function(){
            return ( tankMetadata.y + 1 === gridMetadata.gridSize );
        };

    findFirstNeighourNextToAnEmptyGridPosition();
    insertNextToNeighbour();
}

/**
 * Operation to swap a tank with a neighbour
 */
function SwapTankWithNeighbourOp( tankMetadata ){

    var swapTanks = function( first, second ){

        var firstClone = first.clone(),
            secondClone = second.clone();

        if( second[UP] ) second[UP][DOWN] = first;
        if( second[DOWN] ) second[DOWN][UP] = first;
        if( second[LEFT] ) second[LEFT][RIGHT] = first;
        if( second[RIGHT] ) second[RIGHT][LEFT] = first;

        if( first[UP] ) first[UP][DOWN] = second;
        if( first[DOWN] ) first[DOWN][UP] = second;
        if( first[LEFT] ) first[LEFT][RIGHT] = second;
        if( first[RIGHT] ) first[RIGHT][LEFT] = second;

        if( firstClone[RIGHT] === second ){
            first[LEFT] = second;
            second[RIGHT] = first;
        } else{
            second[RIGHT] = firstClone[RIGHT];
        }

        if( firstClone[LEFT] === second ){
            first[RIGHT] = second;
            second[LEFT] = first;
        } else{
            second[LEFT] = firstClone[LEFT];
        }

        if( firstClone[UP] === second ){
            first[DOWN] = second;
            second[UP] = first;
        } else{
            second[UP] = firstClone[UP];
        }

        if( firstClone[DOWN] === second ){
            first[UP] = second;
            second[DOWN] = first;
        } else{
            second[DOWN] = firstClone[DOWN];
        }

        if( secondClone[RIGHT] === first ){
            second[LEFT] = first;
            first[RIGHT] = second;
        } else{
            first[RIGHT] = secondClone[RIGHT];
        }

        if( secondClone[LEFT] === first ){
            second[RIGHT] = first;
            first[LEFT] = second;
        } else{
            first[LEFT] = secondClone[LEFT];
        }

        if( secondClone[UP] === first ){
            second[UP] = first;
            first[DOWN] = second;
        } else{
            first[UP] = secondClone[UP];
        }

        if( secondClone[DOWN] === first ){
            second[UP] = first;
            first[DOWN] = second;
        } else{
            first[DOWN] = secondClone[DOWN];
        }

        first.x = secondClone.x;
        first.y = secondClone.y;
        second.x = firstClone.x;
        second.y = firstClone.y;
    };

    var neighbour = ( tankMetadata[RIGHT] ) ? tankMetadata[RIGHT] : tankMetadata[DOWN];
    swapTanks( tankMetadata, neighbour );
    return neighbour;
}

/**
 * Operation to extract a tank from an existing grid and 'heal' borken links
 */
function ExtractTankOp( tankMetadata, gridMetadata, initialTank ){

    var left = null,
        up = null;

    // connect left and right neighbours
    left = tankMetadata[LEFT];
    if( left ){
        // unless if left and right neighbours are same, then a single tank on row
        if( left === tankMetadata[RIGHT] ){
            left[RIGHT] = null;
            left[LEFT] = null;
            // an orphan and not initial ? re-add to grid
            if( !left[UP] && left !== initialTank ){
                new InsertTankOp( left, gridMetadata, initialTank );
            }
        } else{
            left[RIGHT] = tankMetadata[RIGHT];
            tankMetadata[RIGHT][LEFT] = left;
        }
    }

    // connect up and down neighbours
    up = tankMetadata[UP];
    if( up ){
        // unless if up and down neighbours are same, then a single tank on column
        if( up === tankMetadata[DOWN] ){
            up[DOWN] = null;
            up[UP] = null;
            // an orphan? re-add to grid
            if( !up[LEFT] && up !== initialTank ){
                new InsertTankOp( up, gridMetadata, initialTank );
            }
        } else{
            up[DOWN] = tankMetadata[DOWN];
            tankMetadata[DOWN][UP] = up;
        }
    }
}

/**
 * Central in-memory fishtank repository and manipulation functions
 */
function FishTanks(){

    var gridMetadata = new GridMetadata(),
        initialTank = null,
        tanks = {},

        isFirstTankInNewRow = function( tankMetadata ){
            return tankMetadata.x + 1 > gridMetadata.gridSize
        },

        isLastTankInRow = function( tankMetadata ){
            return tankMetadata.x === 0 && ( tankMetadata.y + 1 === gridMetadata.gridSize ) && !tankMetadata[LEFT]
        };

    this.addFishTank = function( tankMetadata ){
        if( gridMetadata.tankCount === 0 ){
            initialTank = tankMetadata;
            tankMetadata.x = 0;
            tankMetadata.y = 0;
            tanks[tankMetadata.id] = tankMetadata;
            gridMetadata.tankCount = 1;
            gridMetadata.gridSize = 1;

        } else{
            new InsertTankOp( tankMetadata, gridMetadata, initialTank );
            tanks[tankMetadata.id] = tankMetadata;
            gridMetadata.tankCount++;
            if( isFirstTankInNewRow( tankMetadata ) ){
                gridMetadata.gridSize = tankMetadata.x + 1;
            }
        }
    };

    this.removeFishTank = function( tankMetadata ){
        if( gridMetadata.tankCount === 1 ){
            initialTank = null;
            delete tanks[tankMetadata.id];
            gridMetadata.tankCount = 0;
            gridMetadata.gridSize = 0;

        } else{
            tankMetadata = tanks[tankMetadata.id];
            if( tankMetadata === initialTank ){
                initialTank = new SwapTankWithNeighbourOp( tankMetadata );
            }
            new ExtractTankOp( tankMetadata, gridMetadata, initialTank );
            delete tanks[tankMetadata.id];
            gridMetadata.tankCount--;
            if( gridMetadata.tankCount === 1 ){
                gridMetadata.gridSize = 1;
            } else if( isLastTankInRow( tankMetadata ) ){
                gridMetadata.gridSize--
            }
        }
    };

    this.getFishTankById = function( id ){
        return tanks[id];
    };

    this.copyGridMetadata = function(){
        return new GridMetadata( gridMetadata );
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

        createTankDescriptor = function( tankMetadata, MessageFactory ){
            var descriptor = MessageFactory.createFishTankDescriptor(
                tankMetadata.id, tankMetadata.x, tankMetadata.y );
            if( tankMetadata[LEFT] ) descriptor.left = tankMetadata[LEFT].id;
            if( tankMetadata[RIGHT] ) descriptor.right = tankMetadata[RIGHT].id;
            if( tankMetadata[UP] ) descriptor.top = tankMetadata[UP].id;
            if( tankMetadata[DOWN] ) descriptor.bottom = tankMetadata[DOWN].id;
            return descriptor;
        };

    return {
        addFishTankWithSocket: function( socket, callback ){
            var tankMetadata = new FishTankMetadata( socket );
            fishTanks.addFishTank( tankMetadata );
            if( callback ){
                callback( createTankDescriptor( tankMetadata, MessageFactory ) );
            }
        },

        removeFishTankWithSocket: function( socket, callback ){
            var tankMetadata = new FishTankMetadata( socket );
            fishTanks.removeFishTank( tankMetadata );
            if( callback ){
                callback();
            }
        },

        describeFishTankWithId: function( id ){
            var tankMetadata = fishTanks.getFishTankById( id );
            return tankMetadata ? createTankDescriptor( tankMetadata, MessageFactory ) : null;
        },

        describe: function(){
            return fishTanks.copyGridMetadata();
        }
    };
};





