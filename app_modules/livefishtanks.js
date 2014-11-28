/**
 * Handles all live fish tanks.
 */
module.exports = function( Messages ){
    'use strict';
    var
        /**
         * Constants to ensure strict equalities
         */
        LEFT = 'left',
        RIGHT = 'right',
        UP = 'up',
        DOWN = 'down',

        /**
         * Temporary development debugging
         */
        assert = function( outcome, msg ){
            msg = msg || 'assertion error';
            if( !outcome ){
                throw new Error( msg );
            }
        },

        /**
         * Records tank data and, recursively, that of neighbours
         */
        FishTankMetadata = {

            id: null,
            socket: null,
            LEFT: null,
            RIGHT: null,
            UP: null,
            DOWN: null,
            x: null,
            y: null,

            createDescriptor: function( Messages, recurseLevel ){
                var left,right,up,down;
                if ( recurseLevel && recurseLevel > 0 ) {
                    recurseLevel--;
                    left = ( this[LEFT] ) ? this[LEFT].createDescriptor( Messages, recurseLevel ) : null;
                    right = ( this[RIGHT] ) ?  this[RIGHT].createDescriptor( Messages, recurseLevel ) : null;
                    up =  ( this[UP] ) ?  this[UP].createDescriptor( Messages, recurseLevel ) : null;
                    down = ( this[DOWN] ) ?  this[DOWN].createDescriptor( Messages, recurseLevel ) : null;
                } else{
                    left = ( this[LEFT] ) ? this[LEFT].id : null;
                    right = ( this[RIGHT] ) ? this[RIGHT].id : null;
                    up = ( this[UP] ) ? this[UP].id : null;
                    down = ( this[DOWN] ) ? this[DOWN].id : null;
                }
                // why not object create? because this is all about setting instance variables
                return new Messages.TankDescriptor( this.id, { x: this.x, y: this.y }, left, right, up, down );
            }
        },

        /**
         * Central in-memory fishtank repository and manipulation functions
         */
        FishTanks = function(){

            var gridMetadata = {gridSize: 0, tankCount: 0},
                initialTank = null,
                tanks = Object.create( null ),
                affectedTanks = null,

                isFirstTankInNewRow = function( tankMetadata ){
                    return tankMetadata.x + 1 > gridMetadata.gridSize;
                },

                isLastTankInRow = function( tankMetadata ){
                    return tankMetadata.x === 0 && ( tankMetadata.y + 1 === gridMetadata.gridSize ) && !tankMetadata[LEFT];
                },

                addToAffectedTanks = function( tankMetadata ){
                    if( affectedTanks.indexOf( tankMetadata ) < 0 ){
                        affectedTanks.push( tankMetadata );
                    }
                },

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
                        var originalNeighbour = this.existingNeighbour,
                            possibleNewNeighbour = null;
                        while( stepSize ){
                            possibleNewNeighbour = this.existingNeighbour[this.direction];
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
                                    if( possibleNewNeighbour.x === this.xInsertCoordinate - 1 ){
                                        this.xInsertCoordinate--;
                                        break;
                                    }
                                    // there's a gap between existing tanks
                                    return false;
                                case RIGHT:
                                    if( possibleNewNeighbour.x === this.xInsertCoordinate + 1 ){
                                        this.xInsertCoordinate++;
                                        break;
                                    }
                                    // there's a gap between existing tanks
                                    return false;
                                case UP:
                                    if( possibleNewNeighbour.y === this.yInsertCoordinate - 1 ){
                                        this.yInsertCoordinate--;
                                        break;
                                    }
                                    // there's a gap between existing tanks
                                    return false;
                                case DOWN:
                                    if( possibleNewNeighbour.y === this.yInsertCoordinate + 1 ){
                                        this.yInsertCoordinate++;
                                        break;
                                    }
                                    // there's a gap between existing tanks
                                    return false;
                            }
                            this.existingNeighbour = possibleNewNeighbour;
                            stepSize--;
                        }
                        return true;
                    },

                    insertNextToNeighbour: function(){
                        var oppositeDirection, last, focus;
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
                            last = this.existingNeighbour;
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
                                focus = (this.existingNeighbour[UP]) ? this.existingNeighbour[UP][RIGHT] : null;
                                // if there is an up neighbour that is truly above (i.e not looped)
                                if( focus && ( focus.x === this.tankMetadata.x  ) ){
                                    this.tankMetadata[UP] = focus;
                                    // if up is already connected to a tank to its down, inject new tank
                                    if( focus[DOWN] ){
                                        focus[DOWN][UP] = this.tankMetadata;
                                        addToAffectedTanks( focus[DOWN] );
                                        this.tankMetadata[DOWN] = focus[DOWN];
                                        focus[DOWN] = this.tankMetadata;
                                        addToAffectedTanks( focus );
                                    }
                                }
                                break;
                            case LEFT:
                                // as we are going clockwise, the tank above and to the left of focus (if any )
                                // will become the top of the new tank
                                focus = this.existingNeighbour[UP][LEFT];
                                if( focus ){
                                    this.tankMetadata[UP] = focus;
                                    // if above is already connected to a tank below it, inject new tank
                                    if( focus[DOWN] ){
                                        focus[DOWN][UP] = this.tankMetadata;
                                        addToAffectedTanks( focus[DOWN] );
                                        this.tankMetadata[DOWN] = focus[DOWN];
                                        focus[DOWN] = this.tankMetadata;
                                        addToAffectedTanks( focus );
                                    } else{
                                        // only above and new tank are in this column so loop
                                        this.tankMetadata[DOWN] = focus;
                                        focus[DOWN] = this.tankMetadata;
                                        focus[UP] = this.tankMetadata;
                                        addToAffectedTanks( focus );
                                    }
                                }
                                break;
                            case DOWN:
                                // as we are going clockwise, the tank to the left and down of the focus (if any )
                                // will become the left of the new tank - unless this is new row
                                focus = this.existingNeighbour[LEFT][DOWN];
                                // if there is an left neighbour that is truly left (i.e not looped)
                                if( focus && ( focus.y === this.tankMetadata.y  ) ){
                                    this.tankMetadata[LEFT] = focus;
                                    // if left is already connected to a tank to its right, inject new tank
                                    if( focus[RIGHT] ){
                                        focus[RIGHT][LEFT] = this.tankMetadata;
                                        addToAffectedTanks( focus[RIGHT] );
                                        this.tankMetadata[RIGHT] = focus[RIGHT];
                                        focus[RIGHT] = this.tankMetadata;
                                        addToAffectedTanks( focus );
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
                        var neighbour = this.tankMetadata[RIGHT] || this.tankMetadata[DOWN];
                        this.swapTanks( this.tankMetadata, neighbour );
                        return neighbour;
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
                        var focus = this.tankMetadata[direction], op;
                        if( focus ){
                            // unless if up and down neighbours are same, then a single tank on column
                            if( focus === this.tankMetadata[oppositeDirection] ){
                                focus[oppositeDirection] = null;
                                focus[direction] = null;
                                // an orphan? re-add to grid
                                if( !focus[orthogonalDirection] && focus !== initialTank ){
                                    op = Object.create( InsertTankOp, {
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
                        callback( affectedTanks.slice( 0 ) );
                    }
                }
            };

            this.removeFishTank = function( tankMetadata, callback ){
                var op, index;
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
                        op = Object.create( SwapTankWithNeighbourOp, {
                            tankMetadata: {value: tankMetadata}
                        } );
                        initialTank = op.run();
                    }
                    op = Object.create( ExtractTankOp, {
                        tankMetadata: {value: tankMetadata}
                    } );
                    op.run();
                    delete tanks[tankMetadata.id];
                    gridMetadata.tankCount--;
                    if( gridMetadata.tankCount === 1 ){
                        gridMetadata.gridSize = 1;
                    } else if( isLastTankInRow( tankMetadata ) ){
                        gridMetadata.gridSize--;
                    }
                    if( callback ){
                        index = affectedTanks.indexOf( tankMetadata );
                        if( index > -1 ){
                            affectedTanks.splice( index, 1 );
                        }
                        callback( affectedTanks.slice( 0 ) );
                    }
                }
            };

            this.getFishTankById = function( id ){
                return tanks[id];
            };

            this.copyGridMetadata = function(){
                return {
                    gridSize: gridMetadata.gridSize,
                    tankCount: gridMetadata.tankCount
                };
            };
        },

        fishTanks =  new FishTanks(); //Object.create( FishTanks );

    /**
     * Public API
     */
    return {
        addFishTankWithSocket: function( socket ){
            var metadata = Object.create( FishTankMetadata, {
                id: {value: socket.id},
                socket: {value: socket}
            } );
            fishTanks.addFishTank( metadata, function( affectedTanks ){
                affectedTanks.forEach( function( metadata ){
                    metadata.socket.emit( Messages.TANK_UPDATE, metadata.createDescriptor( Messages ) );
                } );
            } );
        },

        removeFishTankWithSocket: function( socket ){
            var metadata = Object.create( FishTankMetadata, {
                id: {value: socket.id},
                socket: {value: socket}
            } );
            fishTanks.removeFishTank( metadata, function( affectedTanks ){
                affectedTanks.forEach( function( metadata ){
                    metadata.socket.emit( Messages.TANK_UPDATE, metadata.createDescriptor( Messages ) );
                } );
            } );
        },

        teleportFishFromSocket: function( socket, fishDescriptor ) {
            var from = fishTanks.getFishTankById( socket.id ),
                to;
            if ( fishDescriptor.xRelative === 0 ) {
                to = from.left;
                fishDescriptor.xRelative = 1;
            } else if ( fishDescriptor.xRelative === 1 ) {
                to = from.right;
                fishDescriptor.xRelative = 0;
            } else if ( fishDescriptor.yRelative === 0 ) {
                to = from.up;
                fishDescriptor.yRelative = 1;
            } else if ( fishDescriptor.yRelative === 1 ) {
                to = from.down;
                fishDescriptor.yRelative = 0;
            }
            if ( to ) {
                to.socket.emit( Messages.FISH_TELEPORT, fishDescriptor );
            } else {
                console.log( "Problem teleporting..." );
            }
        },

        describe: function(){
            return fishTanks.copyGridMetadata();
        },

        reset: function(){
            fishTanks = new FishTanks();
        }
    };
};





