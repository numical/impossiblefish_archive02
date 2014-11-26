var expect = require( "expect.js" ),
    requirejs = require( 'requirejs' ),
    test = {
        server: null,
        gridSize: null,
        sockets: null,
        tanks: null,
        idMap: null
    },
    properties = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    },

    // note that emit() function will update test data
    MockSocket = function( index ){
        this.id = "TEST_SOCKET_" + index;
        this.emit = function( messageType, tankDescriptor ){
            test.tanks[index] = tankDescriptor;
        };
    },

    resetFishTanks = function( numberOfTanks, done ){

        var calculateGridSize = function( numberOfTanks ){
            var gridWidth = Math.sqrt( numberOfTanks );
            if( gridWidth * gridWidth !== numberOfTanks ){
                gridWidth++;
            }
            return gridWidth;
        };

        test.server.reset();
        test.gridSize = calculateGridSize( numberOfTanks );
        test.sockets = [];
        test.tanks = [];
        test.idMap = {};
        for( var index = 0; index < numberOfTanks; index++ ){
            test.sockets.push( new MockSocket( index ) );
        }
        if( done ) done();

    },

    repopulateFishTanks = function( numberOfTanks, done ){
        resetFishTanks( numberOfTanks, function(){
            for( var i = 0; i < numberOfTanks; i++ ){
                test.server.addFishTankWithSocket( test.sockets[i] );
            }
            if( done ) done();
        } );
    },

    populateIdMap = function( indicesToSkip ){
        for( var i = 0, max = test.tanks.length; i < max; i++ ){
            if( !( indicesToSkip && indicesToSkip.indexOf( i ) > -1) ){
                test.idMap[test.tanks[i].id] = test.tanks[i];
            }
        }
    },

    fail = function(){
        throw new Error( "Deliberate Failure" );
    },

    expectNoBrokenLinks = function( indicesToSkip ){
        var expectAllTankLinksAreValid = function( indicesToSkip ){
                for( var i = 0, max = test.tanks.length; i < max; i++ ){
                    if( !( indicesToSkip && indicesToSkip.indexOf( i ) > -1) ){
                        var tank = test.tanks[i];
                        expectLinkIfAnyIsValid( tank, properties.TOP, properties.BOTTOM );
                        expectLinkIfAnyIsValid( tank, properties.BOTTOM, properties.TOP );
                        expectLinkIfAnyIsValid( tank, properties.LEFT, properties.RIGHT );
                        expectLinkIfAnyIsValid( tank, properties.RIGHT, properties.LEFT );
                    }
                }
            },
            expectLinkIfAnyIsValid = function( tank, property, oppositeProperty ){
                expect( tank[property] ).to.be.ok;
                if( tank[property] ){
                    expect( test.idMap ).to.have.property( tank[property] );
                    var otherTank =  test.idMap[tank[property]];
                    expect( otherTank[oppositeProperty] ).to.equal( tank.id );
                }
            };

        populateIdMap( indicesToSkip );
        expectAllTankLinksAreValid( indicesToSkip );
    };

describe( "Testing livefishtanks ...", function(){

    before( function( done ){
        requirejs.config( {
            nodeRequire: require,
            baseUrl: __dirname + '/../public/js/app'
        } );

        requirejs( ["messages"], function( Messages ){
            test.server = require( '../app_modules/livefishtanks' )( Messages );
            done()
        } );
    } );

    describe( "Sequentially adding first nine fish tanks - testing absolute values", function(){

        describe( "Adding first tank", function(){

            before( function(){
                resetFishTanks( 9 );
                test.server.addFishTankWithSocket( test.sockets[0] );
            } );

            it( "first tank should have an id", function(){
                expect( test.tanks[0] ).to.be.ok();
                expect( test.tanks[0].id ).to.be.ok();
            } );

            it( "first tank should have co-ords of (0,0)", function(){
                expect( test.tanks[0].coords ).to.eql( {x: 0, y: 0} );
            } );

            it( "first tank should have no neighbours", function(){
                expect( test.tanks[0].left ).to.be( null );
                expect( test.tanks[0].right ).to.be( null );
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 1, tankCount: 1} );
            } );
        } );

        describe( "Adding second tank - should go to the right of first tank", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 2; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "second tank should have an id", function(){
                expect( test.tanks[1] ).to.be.ok();
                expect( test.tanks[1].id ).to.be.ok();
            } );

            it( "second tank should have co-ords of (1,0)", function(){
                expect( test.tanks[1].coords ).to.eql( {x: 1, y: 0} );
            } );

            it( "second tank should have first tank left and right", function(){
                expect( test.tanks[1].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[1].right ).to.eql( test.tanks[0].id );
            } );

            it( "second tank should have no tanks top and bottom", function(){
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
            } );

            it( "first tank should have second tank left and right", function(){
                expect( test.tanks[0].left ).to.eql( test.tanks[1].id );
                expect( test.tanks[0].right ).to.eql( test.tanks[1].id );
            } );

            it( "first tank should have no tanks top and bottom", function(){
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );
        } );

        describe( "Adding third tank - should go below second tank in a new row", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 3; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "third tank should have an id", function(){
                expect( test.tanks[2] ).to.be.ok();
                expect( test.tanks[2].id ).to.be.ok();
            } );

            it( "third tank should have co-ords of (1,1)", function(){
                expect( test.tanks[2].coords ).to.eql( {x: 1, y: 1} );
            } );

            it( "third tank should have no tanks left and right", function(){
                expect( test.tanks[2].left ).to.be( null );
                expect( test.tanks[2].right ).to.be( null );
            } );

            it( "third tank should have second tank top and bottom", function(){
                expect( test.tanks[2].top ).to.eql( test.tanks[1].id );
                expect( test.tanks[2].bottom ).to.eql( test.tanks[1].id );
            } );

            it( "second tank should have third tank top and bottom", function(){
                expect( test.tanks[1].top ).to.eql( test.tanks[2].id );
                expect( test.tanks[1].bottom ).to.eql( test.tanks[2].id );
            } );

            it( "second tank should have first tank left and right", function(){
                expect( test.tanks[1].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[1].right ).to.eql( test.tanks[0].id );
            } );

            it( "first tank should have second tank left and right", function(){
                expect( test.tanks[0].left ).to.eql( test.tanks[1].id );
                expect( test.tanks[0].right ).to.eql( test.tanks[1].id );
            } );

            it( "first tank should have no tanks top and bottom", function(){
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
            } );

            it( "tanks description is correct", function(){
                var meta = test.server.describe();
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );
        } );

        describe( "Adding fourth tank - should go to left of third tank and below first tank", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 4; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "fourth tank should have an id", function(){
                expect( test.tanks[3] ).to.be.ok();
                expect( test.tanks[3].id ).to.be.ok();
            } );

            it( "fourth tank should have co-ords of (0,1)", function(){
                expect( test.tanks[3].coords ).to.eql( {x: 0, y: 1} );
            } );

            it( "fourth tank should have third tank left and right", function(){
                expect( test.tanks[3].left ).to.eql( test.tanks[2].id );
                expect( test.tanks[3].right ).to.eql( test.tanks[2].id );
            } );

            it( "fourth tank should have first tank top and bottom", function(){
                expect( test.tanks[3].top ).to.eql( test.tanks[0].id );
                expect( test.tanks[3].bottom ).to.eql( test.tanks[0].id );
            } );

            it( "third tank should have fourth tank left and right", function(){
                expect( test.tanks[2].left ).to.eql( test.tanks[3].id );
                expect( test.tanks[2].right ).to.eql( test.tanks[3].id );
            } );

            it( "third tank should have second fish tank top and bottom", function(){
                expect( test.tanks[2].top ).to.eql( test.tanks[1].id );
                expect( test.tanks[2].bottom ).to.eql( test.tanks[1].id );
            } );

            it( "second tank should have third fish tank top and bottom", function(){
                expect( test.tanks[1].top ).to.eql( test.tanks[2].id );
                expect( test.tanks[1].bottom ).to.eql( test.tanks[2].id );
            } );

            it( "second tank should have first fish tank left and right", function(){
                expect( test.tanks[1].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[1].right ).to.eql( test.tanks[0].id );
            } );

            it( "first tank should have second fish tank left and right", function(){
                expect( test.tanks[0].left ).to.eql( test.tanks[1].id );
                expect( test.tanks[0].right ).to.eql( test.tanks[1].id );
            } );

            it( "first tank should have fourth tank top and bottom", function(){
                expect( test.tanks[0].top ).to.eql( test.tanks[3].id );
                expect( test.tanks[0].bottom ).to.eql( test.tanks[3].id );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 4} );
            } );
        } );

        describe( "Adding fifth tank - should go to right of second tank in new column", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 5; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "fifth tank should have an id", function(){
                expect( test.tanks[4] ).to.be.ok();
                expect( test.tanks[4].id ).to.be.ok();
            } );

            it( "fifth tank should have co-ords of (2,0)", function(){
                expect( test.tanks[4].coords ).to.eql( {x: 2, y: 0} );
            } );

            it( "fifth tank should have second tank to left", function(){
                expect( test.tanks[4].left ).to.eql( test.tanks[1].id );
            } );

            it( "fifth tank should have first tank to right", function(){
                expect( test.tanks[4].right ).to.eql( test.tanks[0].id );
            } );

            it( "fifth tank should have no tanks top and bottom", function(){
                expect( test.tanks[4].top ).to.be( null );
                expect( test.tanks[4].bottom ).to.be( null );
            } );

            it( "first tank should have fifth tank to left (looped)", function(){
                expect( test.tanks[0].left ).to.eql( test.tanks[4].id );
            } );

            it( "second tank should have fifth tank to right", function(){
                expect( test.tanks[1].right ).to.eql( test.tanks[4].id );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 5} );
            } );

        } );

        describe( "Adding sixth tank - should go below fifth tank, to right of third tank", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 6; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "sixth tank should have an id", function(){
                expect( test.tanks[5] ).to.be.ok();
                expect( test.tanks[5].id ).to.be.ok();
            } );

            it( "sixth tank should have co-ords of (2,1)", function(){
                expect( test.tanks[5].coords ).to.eql( {x: 2, y: 1} );
            } );

            it( "sixth tank should have third tank to left", function(){
                expect( test.tanks[5].left ).to.eql( test.tanks[2].id );
            } );

            it( "sixth tank should have fourth tank to right (looped)", function(){
                expect( test.tanks[5].right ).to.eql( test.tanks[3].id );
            } );

            it( "sixth tank should have fifth tank to top and bottom", function(){
                expect( test.tanks[5].top ).to.eql( test.tanks[4].id );
                expect( test.tanks[5].bottom ).to.eql( test.tanks[4].id );
            } );

            it( "fifth tank should have sixth tank to top and bottom", function(){
                expect( test.tanks[4].top ).to.eql( test.tanks[5].id );
                expect( test.tanks[4].bottom ).to.eql( test.tanks[5].id );
            } );

            it( "fourth tank should have sixth tank to left (looped)", function(){
                expect( test.tanks[3].left ).to.eql( test.tanks[5].id );
            } );

            it( "third tank should have sixth tank to right", function(){
                expect( test.tanks[2].right ).to.eql( test.tanks[5].id );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 6} );
            } );

        } );

        describe( "Adding seventh tank - should go below sixth tank, on a new row", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 7; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );
            it( "seventh tank should have an id", function(){
                expect( test.tanks[6] ).to.be.ok();
                expect( test.tanks[6].id ).to.be.ok();
            } );

            it( "seventh tank should have co-ords of (2,2)", function(){
                expect( test.tanks[6].coords ).to.eql( {x: 2, y: 2} );
            } );

            it( "seventh tank should have no tanks left or right", function(){
                expect( test.tanks[6].left ).to.be( null );
                expect( test.tanks[6].right ).to.be( null );
            } );

            it( "seventh tank should sixth tank to top", function(){
                expect( test.tanks[6].top ).to.eql( test.tanks[5].id );
            } );

            it( "seventh tank should fifth tank to bottom (looped)", function(){
                expect( test.tanks[6].bottom ).to.eql( test.tanks[4].id );
            } );

            it( "sixth tank should have seventh tank to bottom", function(){
                expect( test.tanks[5].bottom ).to.eql( test.tanks[6].id );
            } );

            it( "fifth tank should have seventh tank to top", function(){
                expect( test.tanks[4].top ).to.eql( test.tanks[6].id );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 7} );
            } );

        } );

        describe( "Adding eighth tank - should go below third tank, to the left of the seventh", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 8; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "eighth tank should have an id", function(){
                expect( test.tanks[7] ).to.be.ok();
                expect( test.tanks[7].id ).to.be.ok();
            } );

            it( "eighth tank should have co-ords of (1,2)", function(){
                expect( test.tanks[7].coords ).to.eql( {x: 1, y: 2} );
            } );

            it( "eighth tank should third tank to top", function(){
                expect( test.tanks[7].top ).to.eql( test.tanks[2].id );
            } );

            it( "eighth tank should second tank to bottom (looped)", function(){
                expect( test.tanks[7].bottom ).to.eql( test.tanks[1].id );
            } );

            it( "eighth tank should seventh tank to the left and right", function(){
                expect( test.tanks[7].left ).to.eql( test.tanks[6].id );
                expect( test.tanks[7].right ).to.eql( test.tanks[6].id );
            } );

            it( "second tank should have eighth tank to top", function(){
                expect( test.tanks[1].top ).to.eql( test.tanks[7].id );
            } );

            it( "third tank should have eighth tank to bottom", function(){
                expect( test.tanks[2].bottom ).to.eql( test.tanks[7].id );
            } );

            it( "seventh tank should eighth tank to the left and right", function(){
                expect( test.tanks[6].left ).to.eql( test.tanks[7].id );
                expect( test.tanks[6].right ).to.eql( test.tanks[7].id );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
            } );

        } );

        describe( "Adding ninth tank - should go below fourth tank, to the left of the eighth", function(){

            before( function(){
                resetFishTanks( 9 );
                for( var index = 0; index < 9; index++ ){
                    test.server.addFishTankWithSocket( test.sockets[index] );
                }
            } );

            it( "ninth tank should have an id", function(){
                expect( test.tanks[8] ).to.be.ok();
                expect( test.tanks[8].id ).to.be.ok();
            } );

            it( "ninth tank should have co-ords of (0,2)", function(){
                expect( test.tanks[8].coords ).to.eql( {x: 0, y: 2} );
            } );

            it( "ninth tank should fourth tank to top", function(){
                expect( test.tanks[8].top ).to.eql( test.tanks[3].id );
            } );

            it( "ninth tank should first tank to bottom (looped)", function(){
                expect( test.tanks[8].bottom ).to.eql( test.tanks[0].id );
            } );

            it( "ninth tank should eighth tank to right", function(){
                expect( test.tanks[8].right ).to.eql( test.tanks[7].id );
            } );

            it( "ninth tank should seventh tank to left (looped)", function(){
                expect( test.tanks[8].left ).to.eql( test.tanks[6].id );
            } );

            it( "first tank should have ninth tank to top", function(){
                expect( test.tanks[0].top ).to.eql( test.tanks[8].id );
            } );

            it( "fourth tank should have ninth tank to bottom", function(){
                expect( test.tanks[3].bottom ).to.eql( test.tanks[8].id );
            } );

            it( "seventh tank should ninth tank to the right", function(){
                expect( test.tanks[6].right ).to.eql( test.tanks[8].id );
            } );

            it( "eighth tank should ninth tank to the left", function(){
                expect( test.tanks[7].left ).to.eql( test.tanks[8].id );
            } );

            it( "tanks description is correct", function(){
                expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 9} );
            } );

        } );

    } );

    describe( "Sequentially adding first 1024 fish tanks - no gaps - testing relative values", function(){

        before( function( done ){
            var gridSize = 32;
            repopulateFishTanks( gridSize * gridSize, done );
            populateIdMap();
        } );

        it( "there should be (grid size) squared tanks", function(){
            var meta = test.server.describe();
            expect( meta.gridSize ).to.equal( test.gridSize );
            expect( meta.tankCount ).to.equal( test.gridSize * test.gridSize );
        } );

        it( "checking left neighbours' coordinates", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var coords = test.tanks[i].coords;
                var expectedLeftCoords = {
                    x: ( coords.x === 0 ) ? test.gridSize - 1 : coords.x - 1,
                    y: coords.y
                };
                var leftCoords = test.idMap[test.tanks[i].left].coords;
                expect( leftCoords ).to.eql( expectedLeftCoords );
            }
        } );

        it( "checking left neighbours' right links", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var left = test.idMap[test.tanks[i].left];
                expect( left.right ).to.equal( test.tanks[i].id );
            }
        } );

        it( "checking right neighbours' coordinates", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var coords = test.tanks[i].coords;
                var expectedRightCoords = {
                    x: ( coords.x === test.gridSize - 1 ) ? 0 : coords.x + 1,
                    y: coords.y
                };
                var rightCoords = test.idMap [test.tanks[i].right].coords;
                expect( rightCoords ).to.eql( expectedRightCoords );
            }
        } );

        it( "checking right neighbours' left links", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var right = test.idMap[test.tanks[i].right];
                expect( right.left ).to.equal( test.tanks[i].id );
            }
        } );

        it( "checking top neighbours' coordinates", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var coords = test.tanks[i].coords;
                var expectedTopCoords = {
                    x: coords.x,
                    y: ( coords.y === 0 ) ? test.gridSize - 1 : coords.y - 1
                };
                var topCoords = test.idMap[test.tanks[i].top].coords;
                expect( topCoords ).to.eql( expectedTopCoords );
            }
        } );

        it( "checking top neighbours' bottom links", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var top = test.idMap[test.tanks[i].top];
                expect( top.bottom ).to.equal( test.tanks[i].id );
            }
        } );

        it( "checking bottom neighbours' coordinates", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var coords = test.tanks[i].coords;
                var expectedBottomCoords = {
                    x: coords.x,
                    y: ( coords.y === test.gridSize - 1 ) ? 0 : coords.y + 1
                };
                var bottomCoords = test.idMap[test.tanks[i].bottom].coords;
                expect( bottomCoords ).to.eql( expectedBottomCoords );
            }
        } );

        it( "checking bottom neighbours' top links", function(){
            for( var i = 0; i < test.tanks.length; i++ ){
                var bottom = test.idMap[test.tanks[i].bottom];
                expect( bottom.top ).to.equal( test.tanks[i].id );
            }
        } );
    } )

    describe( "Deleting from 2x2 grid", function(){

        describe( "Add and remove single tank", function(){

            before( function( done ){
                repopulateFishTanks( 1, done );
            } );

            it( "removing tank reverts to initial state", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.server.describe() ).to.eql( {gridSize: 0, tankCount: 0} );
            } );

        } );

        describe( "Add two and remove second tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 2, done );
            } );

            it( "removing second tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.server.describe() ).to.eql( {gridSize: 1, tankCount: 1} );
            } );

            it( "removing second tank results in first having no neighbours", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.tanks[0].left ).to.be( null );
                expect( test.tanks[0].right ).to.be( null );
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
            } );
        } );

        describe( "Add two and remove first tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 2, done );
            } );

            it( "removing first tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.server.describe() ).to.eql( {gridSize: 1, tankCount: 1} );
            } );

            it( "removing first tank results in second having no neighbours", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[1].left ).to.be( null );
                expect( test.tanks[1].right ).to.be( null );
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
            } );

            it( "removing first tank results in second moving to (0,0)", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[1].coords ).to.eql( {x: 0, y: 0} );
            } );
        } );

        describe( "Add three and remove third tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 3, done );
            } );

            it( "removing third tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[2] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );

            it( "removing third tank results in second having no top/bottom neighbours", function(){
                test.server.removeFishTankWithSocket( test.sockets[2] );
                expect( test.tanks[1].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[1].right ).to.equal( test.tanks[0].id );
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
            } );
        } );

        describe( "Add three and remove second tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 3, done );
            } );

            it( "removing second tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );

            it( "removing second tank results in third tank moving to (1,0)", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.tanks[2].coords ).to.eql( {x: 1, y: 0} );
            } );

            it( "removing second tank results in third tank linking left/right to first tank", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.tanks[2].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[2].right ).to.equal( test.tanks[0].id );
                expect( test.tanks[2].top ).to.be( null );
                expect( test.tanks[2].bottom ).to.be( null );
            } );
        } );

        describe( "Add three and remove first tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 3, done );
            } );

            it( "removing first tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[2] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );

            it( "removing first tank results in results in second tank moving to (0,0)", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[1].coords ).to.eql( {x: 0, y: 0} );
            } );

            it( "removing first tank results in results in third tank moving to (1,0)", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[2].coords ).to.eql( {x: 1, y: 0} );
            } );

            it( "removing first tank results in second tank linking left/right to third tank", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[2].left ).to.eql( test.tanks[1].id );
                expect( test.tanks[2].right ).to.equal( test.tanks[1].id );
                expect( test.tanks[2].top ).to.be( null );
                expect( test.tanks[2].bottom ).to.be( null );
            } );
        } );

        describe( "Add four and remove fourth tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 4, done );
            } );

            it( "removing fourth tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[3] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );

            it( "removing fourth tank results in first having no up/down neighbours " +
            "and third having no left right neighbours", function(){
                test.server.removeFishTankWithSocket( test.sockets[3] );
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
                expect( test.tanks[2].left ).to.be( null );
                expect( test.tanks[2].right ).to.be( null );
            } );
        } );

        describe( "Add four and remove third tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 4, done );
            } );

            it( "removing fourth tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[2] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );

            it( "removing third tank results in second having no up/down neighbours " +
            "and fourth having no left right neighbours", function(){
                test.server.removeFishTankWithSocket( test.sockets[2] );
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
                expect( test.tanks[3].left ).to.be( null );
                expect( test.tanks[3].right ).to.be( null );
            } );
        } );

        describe( "Add four and remove second tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 4, done );
            } );

            it( "removing second tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );

            it( "removing second tank results in third having no up/down neighbours " +
            "and first having no left right neighbours", function(){
                test.server.removeFishTankWithSocket( test.sockets[1] );
                expect( test.tanks[2].top ).to.be( null );
                expect( test.tanks[2].bottom ).to.be( null );
                expect( test.tanks[0].left ).to.be( null );
                expect( test.tanks[0].right ).to.be( null );
            } );
        } );

        describe( "Add four and remove first tank", function(){

            beforeEach( function( done ){
                repopulateFishTanks( 4, done );
            } );

            it( "removing second tank results in corrected tanks description", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );

            it( "removing first tank results in results in second tank moving to (0,0)", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[1].coords ).to.eql( {x: 0, y: 0} );
            } );

            it( "removing first tank results in results in second tank linking up/down to fourth", function(){
                test.server.removeFishTankWithSocket( test.sockets[0] );
                expect( test.tanks[1].top ).to.eql( test.tanks[3].id );
                expect( test.tanks[1].bottom ).to.eql( test.tanks[3].id );
                expect( test.tanks[1].left ).to.be( null );
                expect( test.tanks[1].right ).to.be( null );
            } );
        } );
    } );

    describe( "Deleting a single tank from 3x3 grid", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 9, done );
        } );

        it( "removing first tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 0;
            test.server.removeFishTankWithSocket( test.sockets[0] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing second tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 1;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing third tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 2;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing fourth tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 3;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing fifth tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 4;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing sxith tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 5;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing seventh tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 6;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing eighth tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 7;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );

        it( "removing ninth tank leaves no unbroken links and correct metadata", function(){
            var removedIndex = 8;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    describe( "Deleting multiple tanks from 3x3 grid", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 9, done );
        } );

        it( "removing eight and ninth leaves no unbroken links and correct metadata", function(){
            var removed = [8, 7];
            test.server.removeFishTankWithSocket( test.sockets[removed[0]] );
            test.server.removeFishTankWithSocket( test.sockets[removed[1]] );
            expectNoBrokenLinks( removed );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 7} );
        } );

        it( "removing first and second leaves no unbroken links and correct metadata", function(){
            var removed = [0, 1];
            test.server.removeFishTankWithSocket( test.sockets[removed[0]] );
            test.server.removeFishTankWithSocket( test.sockets[removed[1]] );
            expectNoBrokenLinks( removed );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 7} );
        } );

        it( "removing first and eigtht leaves no unbroken links and correct metadata", function(){
            var removed = [0, 8];
            test.server.removeFishTankWithSocket( test.sockets[removed[0]] );
            test.server.removeFishTankWithSocket( test.sockets[removed[1]] );
            expectNoBrokenLinks( removed );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 7} );
        } );
    } );

    describe( "Re-adding to a 3x3 grid", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 9, done );
        } );

        it( "remove ninth and re-add", function(){
            var removedIndex = 8;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();

        } );

        it( "remove eighth and re-add", function(){
            var removedIndex = 7;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove seventh and re-add", function(){
            var removedIndex = 6;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove sixth and re-add", function(){
            var removedIndex = 5;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove fifth and re-add", function(){
            var removedIndex = 4;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove fourth and re-add", function(){
            var removedIndex = 3;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove third and re-add", function(){
            var removedIndex = 2;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove second and re-add", function(){
            var removedIndex = 1;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );

        it( "remove first and re-add", function(){
            var removedIndex = 0;
            test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
            test.server.addFishTankWithSocket( test.sockets[removedIndex] );
            expectNoBrokenLinks();
        } );
    } );

    describe( "Re-adding to a 5x5 grid", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 25, done );
        } );

        it( "delete and re-add a single tank from each position", function(){
            for( var removedIndex = 0, numberOfTanks = 25; removedIndex < numberOfTanks; removedIndex++ ){
                test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
                test.server.addFishTankWithSocket( test.sockets[removedIndex] );
                expectNoBrokenLinks();
            }
        } );

        it( "delete and re-add two consecutive tanks from each position", function(){
            for( var removedIndex = 0, numberOfTanks = 25; removedIndex < numberOfTanks - 1; removedIndex++ ){
                test.server.removeFishTankWithSocket( test.sockets[removedIndex] );
                test.server.removeFishTankWithSocket( test.sockets[removedIndex + 1] );
                test.server.addFishTankWithSocket( test.sockets[removedIndex] );
                test.server.addFishTankWithSocket( test.sockets[removedIndex + 1] );
                expectNoBrokenLinks();
            }
        } );
    } );
});
