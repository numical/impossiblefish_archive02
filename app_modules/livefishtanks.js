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
};

/**
 * Central in-memory fishtank repository and manipulation functions
 */
function FishTanks(){

    var gridMetadata = new GridMetadata(),
        initialTank = null,
        tanks = Object.create( null ),
        affectedTanks = null,

        InsertTankOp = {

            tankMetadata: null,
            existingNeighbour: null,
            xInsertCoordinate: 0,
            yInsertCoordinate: 0,
            direction: RIGHT,

            run: function(){
                this.existingNeighbour = initialTank;
                this.findFirstNeighourNextToAnEmptyGridPosition();
                this.insertNextToNeighbour();
            },

            findFirstNeighourNextToAnEmptyGridPosition: function(){
                var continueToLoop,
                    stepSize = 0;
                do{
                    continueToLoop = false;
                    stepSize++;
                    this.direction = RIGHT;
                    if( this.moveToAnotherNeighbour( stepSize ) ){
                        this.direction = DOWN;
                        if( this.moveToAnotherNeighbour( stepSize ) ){
                            this.direction = LEFT;
                            if( this.moveToAnotherNeighbour( stepSize ) ){
                                this.direction = UP;
                                if( this.moveToAnotherNeighbour( stepSize ) ){
                                    assert( this.existingNeighbour === initialTank );
                                    continueToLoop = true;
                                } else{
                                    assert( false, 'looping around grid has gone wrong' );
                                }
                            }
                        }
                    }
                } while( continueToLoop );
            },

            moveToAnotherNeighbour: function( stepSize ){
                var originalNeighbour = this.existingNeighbour;
                while( stepSize ){
                    var possibleNewNeighbour = this.existingNeighbour[this.direction];
                    if( !possibleNewNeighbour ){
                        // no neighbour defined
                        return false;
                    }
                    if( possibleNewNeighbour === originalNeighbour ){
                        // have looped around column/row
                        return false;
                    }
                    switch( this.direction ){
                        case LEFT:
                            if( possibleNewNeighbour.x !== this.xInsertCoordinate - 1 ){
                                //isAGapBetweenExistingTanks = true;
                                return false;
                            } else{
                                this.xInsertCoordinate--;
                                break;
                            }
                        case RIGHT:
                            if( possibleNewNeighbour.x !== this.xInsertCoordinate + 1 ){
                                //isAGapBetweenExistingTanks = true;
                                return false;
                            } else{
                                this.xInsertCoordinate++;
                                break;
                            }
                        case UP:
                            if( possibleNewNeighbour.y !== this.yInsertCoordinate - 1 ){
                                //isAGapBetweenExistingTanks = true;
                                return false;
                            } else{
                                this.yInsertCoordinate--;
                                break;
                            }
                        case DOWN:
                            if( possibleNewNeighbour.y !== this.yInsertCoordinate + 1 ){
                                //isAGapBetweenExistingTanks = true;
                                return false;
                            } else{
                                this.yInsertCoordinate++;
                                break;
                            }
                    }
                    this.existingNeighbour = possibleNewNeighbour;
                    stepSize--;
                }
                return true;
            },

            insertNextToNeighbour: function(){
                var oppositeDirection;
                switch( this.direction ){
                    case LEFT:
                        oppositeDirection = RIGHT;
                        this.xInsertCoordinate--;
                        break;
                    case RIGHT:
                        oppositeDirection = LEFT;
                        this.xInsertCoordinate++;
                        break;
                    case UP:
                        oppositeDirection = DOWN;
                        this.yInsertCoordinate--;
                        break;
                    case DOWN:
                        oppositeDirection = UP;
                        this.yInsertCoordinate++;
                        break;
                    default:
                        assert( false, oppositeDirection );
                }
                this.tankMetadata.x = this.xInsertCoordinate;
                this.tankMetadata.y = this.yInsertCoordinate;

                // if focus has tank(s) to the other side of the add
                if( this.existingNeighbour[oppositeDirection] ){
                    // put new tank on the correct side
                    this.existingNeighbour[this.direction] = this.tankMetadata;
                    this.tankMetadata[oppositeDirection] = this.existingNeighbour;
                    // find 'last' tank - i.e. the tank that previously connected to focus
                    var last = this.existingNeighbour;
                    while( last[oppositeDirection] !== this.tankMetadata[oppositeDirection] ){
                        last = last[oppositeDirection];
                        assert( last );  // no gaps
                    }
                    last[oppositeDirection] = this.tankMetadata;
                    this.tankMetadata[this.direction] = last;
                    // record affected tanks
                    addToAffectedTanks( this.existingNeighbour );
                    addToAffectedTanks( last );

                } else{
                    // no tanks on the other side of the focus
                    // hence focus and new tank are the only tanks on this row/column
                    this.tankMetadata[oppositeDirection] = this.existingNeighbour;
                    this.tankMetadata[this.direction] = this.existingNeighbour;
                    this.existingNeighbour[oppositeDirection] = this.tankMetadata;
                    this.existingNeighbour[this.direction] = this.tankMetadata;
                    addToAffectedTanks( this.existingNeighbour );
                }

                // any connections for orthogonal direction?
                switch( this.direction ){
                    case RIGHT:
                        // always be on top row
                        var up = (this.existingNeighbour[UP]) ? this.existingNeighbour[UP][RIGHT] : null;
                        // if there is an up neighbour that is truly above (i.e not looped)
                        if( up && ( up.x === this.tankMetadata.x  ) ){
                            this.tankMetadata[UP] = up;
                            // if up is already connected to a tank to its down, inject new tank
                            if( up[DOWN] ){
                                up[DOWN][UP] = this.tankMetadata;
                                addToAffectedTanks( up[DOWN] );
                                this.tankMetadata[DOWN] = up[DOWN];
                                up[DOWN] = this.tankMetadata;
                                addToAffectedTanks( up );
                            }
                        }
                        break;
                    case LEFT:
                        // as we are going clockwise, the tank above and to the left of focus (if any )
                        // will become the top of the new tank
                        var above = this.existingNeighbour[UP][LEFT];
                        if( above ){
                            this.tankMetadata[UP] = above;
                            // if above is already connected to a tank below it, inject new tank
                            if( above[DOWN] ){
                                above[DOWN][UP] = this.tankMetadata;
                                addToAffectedTanks( above[DOWN] );
                                this.tankMetadata[DOWN] = above[DOWN];
                                above[DOWN] = this.tankMetadata;
                                addToAffectedTanks( above );
                            } else{
                                // only above and new tank are in this column so loop
                                this.tankMetadata[DOWN] = above;
                                above[DOWN] = this.tankMetadata;
                                above[UP] = this.tankMetadata;
                                addToAffectedTanks( above );
                            }
                        }
                        break;
                    case DOWN:
                        // as we are going clockwise, the tank to the left and down of the focus (if any )
                        // will become the left of the new tank - unless this is new row
                        var left = this.existingNeighbour[LEFT][DOWN];
                        // if there is an left neighbour that is truly left (i.e not looped)
                        if( left && ( left.y === this.tankMetadata.y  ) ){
                            this.tankMetadata[LEFT] = left;
                            // if left is already connected to a tank to its right, inject new tank
                            if( left[RIGHT] ){
                                left[RIGHT][LEFT] = this.tankMetadata;
                                addToAffectedTanks( left[RIGHT] );
                                this.tankMetadata[RIGHT] = left[RIGHT];
                                left[RIGHT] = this.tankMetadata;
                                addToAffectedTanks( left );
                            }
                        }
                        break;
                }
            },

            isANewRow: function(){
                return ( this.tankMetadata.y + 1 === this.gridMetadata.gridSize );
            }
        },

        /**
         * Operation to swap a tank with a neighbour
         */
        SwapTankWithNeighbourOp = {

            tankMetadata: null,

            run: function(){
                var neighbour = ( this.tankMetadata[RIGHT] ) ? this.tankMetadata[RIGHT] : this.tankMetadata[DOWN];
                this.swapTanks( this.tankMetadata, neighbour );
                return neighbour
            },

            swapTanks: function( first, second ){

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

                addToAffectedTanks( first );
                addToAffectedTanks( second );

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
            }
        },

        /**
         * Operation to extract a tank from an existing grid and 'heal' borken links
         */
        ExtractTankOp = {

            tankMetadata: null,

            run: function(){
                this.connectNeighbours( LEFT, RIGHT, UP );
                this.connectNeighbours( UP, DOWN, LEFT );
            },


            connectNeighbours: function( direction, oppositeDirection, orthogonalDirection ){
                var focus = this.tankMetadata[direction];
                if( focus ){
                    // unless if up and down neighbours are same, then a single tank on column
                    if( focus === this.tankMetadata[oppositeDirection] ){
                        focus[oppositeDirection] = null;
                        focus[direction] = null;
                        // an orphan? re-add to grid
                        if( !focus[orthogonalDirection] && focus !== initialTank ){
                            var op = Object.create( InsertTankOp, {
                                tankMetadata: {value: focus}
                            } );
                            op.run();
                        }
                        addToAffectedTanks( focus );
                    } else{
                        focus[oppositeDirection] = this.tankMetadata[oppositeDirection];
                        this.tankMetadata[oppositeDirection][direction] = focus;
                        addToAffectedTanks( focus );
                        addToAffectedTanks( focus[oppositeDirection] );
                    }

                    // if connected to self (i.e. now only tank in column ) then remove links
                    if( focus === focus[direction] && focus === focus[oppositeDirection] ){
                        focus[direction] = null;
                        focus[oppositeDirection] = null;
                    }
                }
            }
        },

        isFirstTankInNewRow = function( tankMetadata ){
            return tankMetadata.x + 1 > gridMetadata.gridSize
        },

        isLastTankInRow = function( tankMetadata ){
            return tankMetadata.x === 0 && ( tankMetadata.y + 1 === gridMetadata.gridSize ) && !tankMetadata[LEFT]
        },

        addToAffectedTanks = function( tankMetadata ){
            if( affectedTanks.indexOf( tankMetadata ) < 0 ){
                affectedTanks.push( tankMetadata );
            }
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
            affectedTanks = [tankMetadata];
            var op = Object.create( InsertTankOp, {
                tankMetadata: {value: tankMetadata}
            } );
            op.run();
            tanks[tankMetadata.id] = tankMetadata;
            gridMetadata.tankCount++;
            if( isFirstTankInNewRow( tankMetadata ) ){
                gridMetadata.gridSize = tankMetadata.x + 1;
            }
            if( callback ){
                callback( affectedTanks.slice(0) );
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
            affectedTanks = [];
            tankMetadata = tanks[tankMetadata.id];
            if( tankMetadata === initialTank ){
                var op = Object.create( SwapTankWithNeighbourOp, {
                    tankMetadata: {value: tankMetadata}
                } );
                initialTank = op.run();
            }
            var op = Object.create( ExtractTankOp, {
                tankMetadata: {value: tankMetadata}
            } );
            op.run();
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
                callback( affectedTanks.slice(0) );
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





