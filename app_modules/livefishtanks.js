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

    this.id = socket.id;
    this.socket = socket;
    this[LEFT] = null;
    this[RIGHT] = null;
    this[UP] = null;
    this[DOWN] = null;
    this.x = null;
    this.y = null;
}

/**
 * Operation to insert a tank into an existing grid
 */
function InsertTankOp( tankMetadata, gridMetadata, initialTank, affectedTanks ){

    var existingNeighbour = initialTank,
        xInsertCoordinate = 0,
        yInsertCoordinate = 0,
        direction = RIGHT,

        findFirstNeighourNextToAnEmptyGridPosition = function(){
            var continueToLoop,
                stepSize = 0;
            do{
                continueToLoop = false;
                stepSize++;
                direction = RIGHT;
                if( moveToAnotherNeighbour( stepSize ) ){
                    direction = DOWN;
                    if( moveToAnotherNeighbour( stepSize ) ){
                        direction = LEFT;
                        if( moveToAnotherNeighbour( stepSize ) ){
                            direction = UP;
                            if( moveToAnotherNeighbour( stepSize ) ){
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

        moveToAnotherNeighbour = function( stepSize ){
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
                // record affected tanks
                addToAffectedTanks( existingNeighbour );
                addToAffectedTanks( last );

            } else{
                // no tanks on the other side of the focus
                // hence focus and new tank are the only tanks on this row/column
                tankMetadata[oppositeDirection] = existingNeighbour;
                tankMetadata[direction] = existingNeighbour;
                existingNeighbour[oppositeDirection] = tankMetadata;
                existingNeighbour[direction] = tankMetadata;
                addToAffectedTanks( existingNeighbour );
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
                            addToAffectedTanks( up[DOWN] );
                            tankMetadata[DOWN] = up[DOWN];
                            up[DOWN] = tankMetadata;
                            addToAffectedTanks( up );

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
                            addToAffectedTanks( above[DOWN] );
                            tankMetadata[DOWN] = above[DOWN];
                            above[DOWN] = tankMetadata;
                            addToAffectedTanks( above );
                        } else{
                            // only above and new tank are in this column so loop
                            tankMetadata[DOWN] = above;
                            above[DOWN] = tankMetadata;
                            above[UP] = tankMetadata;
                            addToAffectedTanks( above );
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
                            addToAffectedTanks( left[RIGHT] );
                            tankMetadata[RIGHT] = left[RIGHT];
                            left[RIGHT] = tankMetadata;
                            addToAffectedTanks( left );
                        }
                    }
                    break;
            }
        },

        addToAffectedTanks = function( tankMetadata ){
            if( affectedTanks.indexOf( tankMetadata ) < 0 ){
                affectedTanks.push( tankMetadata );
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
function SwapTankWithNeighbourOp( tankMetadata, affectedTanks ){

    var swapTanks = function( first, second ){

            var initialFirstLeft = first[LEFT],
                initialFirstRight = first[RIGHT],
                initialFirstUp = first[UP],
                initialFirstDown = first[DOWN],
                initialFirstX = first.x,
                initialFirstY = first.y,
                initialSecondLeft = second[LEFT],
                initialSecondRight = second[RIGHT],
                initialSecondUp = second[UP],
                initialSecondDown = second[DOWN],
                initialSecondX = second.x,
                initialSecondY = second.y;

            if( second[UP] ){
                second[UP][DOWN] = first;
                addToAffectedTanks( second[UP] );
            }
            if( second[DOWN] ){
                second[DOWN][UP] = first;
                addToAffectedTanks( second[DOWN] );
            }
            if( second[LEFT] ){
                second[LEFT][RIGHT] = first;
                addToAffectedTanks( second[LEFT] );
            }
            if( second[RIGHT] ){
                second[RIGHT][LEFT] = first;
                addToAffectedTanks( second[RIGHT] );
            }

            if( first[UP] ){
                first[UP][DOWN] = second;
                addToAffectedTanks( first[UP] );
            }
            if( first[DOWN] ){
                first[DOWN][UP] = second;
                addToAffectedTanks( first[DOWN] );
            }
            if( first[LEFT] ){
                first[LEFT][RIGHT] = second;
                addToAffectedTanks( first[LEFT] );
            }
            if( first[RIGHT] ){
                first[RIGHT][LEFT] = second;
                addToAffectedTanks( first[RIGHT] );
            }

            if( initialFirstRight === second ){
                first[LEFT] = second;
                second[RIGHT] = first;
            } else{
                second[RIGHT] = initialFirstRight;
            }

            if( initialFirstLeft === second ){
                first[RIGHT] = second;
                second[LEFT] = first;
            } else{
                second[LEFT] = initialFirstLeft;
            }

            if( initialFirstUp === second ){
                first[DOWN] = second;
                second[UP] = first;
            } else{
                second[UP] = initialFirstUp;
            }

            if( initialFirstDown === second ){
                first[UP] = second;
                second[DOWN] = first;
            } else{
                second[DOWN] = initialFirstDown;
            }

            if( initialSecondRight === first ){
                second[LEFT] = first;
                first[RIGHT] = second;
            } else{
                first[RIGHT] = initialSecondRight;
            }

            if( initialSecondLeft === first ){
                second[RIGHT] = first;
                first[LEFT] = second;
            } else{
                first[LEFT] = initialSecondLeft;
            }

            if( initialSecondUp === first ){
                second[UP] = first;
                first[DOWN] = second;
            } else{
                first[UP] = initialSecondUp;
            }

            if( initialSecondDown === first ){
                second[UP] = first;
                first[DOWN] = second;
            } else{
                first[DOWN] = initialSecondDown;
            }

            first.x = initialSecondX;
            first.y = initialSecondY;
            second.x = initialFirstX;
            second.y = initialFirstY;
        },

        addToAffectedTanks = function( tankMetadata ){
            if( affectedTanks.indexOf( tankMetadata ) < 0 ){
                affectedTanks.push( tankMetadata );
            }
        };

    var neighbour = ( tankMetadata[RIGHT] ) ? tankMetadata[RIGHT] : tankMetadata[DOWN];
    swapTanks( tankMetadata, neighbour );
    addToAffectedTanks( tankMetadata );
    addToAffectedTanks( neighbour );
    return neighbour;
}

/**
 * Operation to extract a tank from an existing grid and 'heal' borken links
 */
function ExtractTankOp( tankMetadata, gridMetadata, initialTank, affectedTanks ){

    var left = null,
        up = null,

        addToAffectedTanks = function( tankMetadata ){
            if( affectedTanks.indexOf( tankMetadata ) < 0 ){
                affectedTanks.push( tankMetadata );
            }
        };

    // connect left and right neighbours
    left = tankMetadata[LEFT];
    if( left ){
        // unless if left and right neighbours are same, then a single tank on row
        if( left === tankMetadata[RIGHT] ){
            left[RIGHT] = null;
            left[LEFT] = null;
            // an orphan and not initial ? re-add to grid
            if( !left[UP] && left !== initialTank ){
                new InsertTankOp( left, gridMetadata, initialTank, affectedTanks );
            }
            addToAffectedTanks( left );
        } else{
            left[RIGHT] = tankMetadata[RIGHT];
            tankMetadata[RIGHT][LEFT] = left;
            addToAffectedTanks( left );
            addToAffectedTanks( left[RIGHT] );
        }

        // if left is connected to self (i.e. now only tank on row) then remove links
        if( left === left[LEFT] && left === left[RIGHT] ){
            left[LEFT] = null;
            left[RIGHT] = null;
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
                new InsertTankOp( up, gridMetadata, initialTank, affectedTanks );
            }
            addToAffectedTanks( up );
        } else{
            up[DOWN] = tankMetadata[DOWN];
            tankMetadata[DOWN][UP] = up;
            addToAffectedTanks( up );
            addToAffectedTanks( up[DOWN] );
        }

        // if connected to self (i.e. now only tank in column ) then remove links
        if( up === up[UP] && up === up[DOWN] ){
            up[UP] = null;
            up[DOWN] = null;
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

    this.addFishTank = function( tankMetadata, callback ){
        if( gridMetadata.tankCount === 0 ){
            initialTank = tankMetadata;
            tankMetadata.x = 0;
            tankMetadata.y = 0;
            tanks[tankMetadata.id] = tankMetadata;
            gridMetadata.tankCount = 1;
            gridMetadata.gridSize = 1;
            if( callback ){
                callback( [tankMetadata] );
            }
        } else{
            var affectedTanks = [tankMetadata];
            new InsertTankOp( tankMetadata, gridMetadata, initialTank, affectedTanks );
            tanks[tankMetadata.id] = tankMetadata;
            gridMetadata.tankCount++;
            if( isFirstTankInNewRow( tankMetadata ) ){
                gridMetadata.gridSize = tankMetadata.x + 1;
            }
            if( callback ){
                callback( affectedTanks );
            }
        }
    };

    this.removeFishTank = function( tankMetadata, callback ){
        if( gridMetadata.tankCount === 1 ){
            initialTank = null;
            delete tanks[tankMetadata.id];
            gridMetadata.tankCount = 0;
            gridMetadata.gridSize = 0;
            if( callback ){
                callback( [] );
            }
        } else{
            var affectedTanks = [];
            tankMetadata = tanks[tankMetadata.id];
            if( tankMetadata === initialTank ){
                initialTank = new SwapTankWithNeighbourOp( tankMetadata, affectedTanks );
            }
            new ExtractTankOp( tankMetadata, gridMetadata, initialTank, affectedTanks );
            delete tanks[tankMetadata.id];
            gridMetadata.tankCount--;
            if( gridMetadata.tankCount === 1 ){
                gridMetadata.gridSize = 1;
            } else if( isLastTankInRow( tankMetadata ) ){
                gridMetadata.gridSize--
            }
            if( callback ){
                var index = affectedTanks.indexOf( tankMetadata );
                if( index > -1 ){
                    affectedTanks.splice( index, 1 );
                }
                callback( affectedTanks );
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
module.exports = function( Messages ){

    var fishTanks = new FishTanks(),

        createTankDescriptor = function( metadata, Messages ){
            return new Messages.TankDescriptor(
                metadata.id,
                metadata.x,
                metadata.y,
                ( metadata[LEFT] ) ? metadata[LEFT].id : null,
                ( metadata[RIGHT] ) ? metadata[RIGHT].id : null,
                ( metadata[UP] ) ? metadata[UP].id : null,
                ( metadata[DOWN] ) ? metadata[DOWN].id : null );
        };

    return {
        addFishTankWithSocket: function( socket ){
            fishTanks.addFishTank( new FishTankMetadata( socket ), function( affectedTanks ){
                affectedTanks.forEach( function( metadata ){
                    metadata.socket.emit( Messages.TANK_UPDATE, createTankDescriptor( metadata, Messages ) );
                } );
            } );
        },

        removeFishTankWithSocket: function( socket ){
            fishTanks.removeFishTank( new FishTankMetadata( socket ), function( affectedTanks ){
                affectedTanks.forEach( function( metadata ){
                    metadata.socket.emit( Messages.TANK_UPDATE, createTankDescriptor( metadata, Messages ) );
                } );
            } );
        },

        describe: function(){
            return fishTanks.copyGridMetadata();
        },

        reset: function(){
            fishTanks = new FishTanks();
        }
    };
};





