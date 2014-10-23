var expect = require( "expect.js" ),
    requirejs = require( 'requirejs' ),
    test = {
        server: null,
        gridSize: null,
        sockets: null,
        tanks: null
    },
    properties = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    },

    resetFishTanks = function( numberOfTanks, done ){

        var calculateGridSize = function( numberOfTanks ){
            var gridWidth = Math.sqrt( numberOfTanks );
            if( gridWidth * gridWidth !== numberOfTanks ){
                gridWidth++;
            }
            return gridWidth;
        }

        requirejs.config( {
            nodeRequire: require,
            baseUrl: __dirname + '/../public/js/app'
        } );

        requirejs( ["messagefactory"], function( MessageFactory ){
            test.server = require( '../app_modules/livefishtanks' )( MessageFactory );
            test.gridSize = calculateGridSize( numberOfTanks );
            test.sockets = [];
            test.tanks = [];
            for( var id = 0; id < numberOfTanks; id++ ){
                test.sockets.push( {id: "TEST_SOCKET_" + id} );
            }
            done();
        } );

    },

    repopulateFishTanks = function( numberOfTanks, done ){
        resetFishTanks( numberOfTanks, function(){
            for( var i = 0; i < numberOfTanks; i++ ){
                test.server.addFishTankWithSocket( test.sockets[i], function( descriptor ){
                    test.tanks[i] = descriptor;
                } );
            }
            for( var i = 0; i < numberOfTanks; i++ ){
                test.tanks[i] = test.server.describeFishTankWithId( test.tanks[i].id );
            }
            done();
        } );
    },

    fail = function(){
        throw new Error( "Deliberate Failure" );
    },

    refreshTestTanks = function(){

        for( var i = 0, max = test.tanks.length; i < max; i++ ){
            var id = test.tanks[i] ? test.tanks[i].id : test.sockets[i].id;
            test.tanks[i] = test.server.describeFishTankWithId( id );
        }
    },

    expectNoBrokenLinks = function( indicesToSkip ){
        var idMap = {},
            populateIdMap = function(){
                for( var i = 0, max = test.tanks.length; i < max; i++ ){
                    if( !( indicesToSkip && indicesToSkip.indexOf( i ) > -1) ){
                        idMap[ test.tanks[i].id ] = test.tanks[i];
                    }
                }
            },
            expectEachTankIsValid = function( indicesToSkip ){
                for( var i = 0, max = test.tanks.length; i < max; i++ ){
                    if( !( indicesToSkip && indicesToSkip.indexOf( i ) > -1) ){
                        var tank = test.tanks[i];
                        expectTankExists( tank, properties.TOP );
                        expectLinkIsConsistent( tank, properties.TOP, properties.BOTTOM );
                        expectTankExists( tank, properties.BOTTOM );
                        expectLinkIsConsistent( tank, properties.BOTTOM, properties.TOP );
                        expectTankExists( tank, properties.LEFT );
                        expectLinkIsConsistent( tank, properties.LEFT, properties.RIGHT );
                        expectTankExists( tank, properties.RIGHT );
                        expectLinkIsConsistent( tank, properties.RIGHT, properties.LEFT );
                    }
                }
            },
            expectLinkIsConsistent = function( tank, property, oppositeProperty ){
                var otherTank = idMap[ tank[property] ];
                expect ( otherTank[oppositeProperty] ).to.equal( tank.id );
            },
            expectTankExists = function( tank, property ){
                expect( tank[property] ).to.be.ok;
                expect( idMap ).to.have.property( tank[property] );
            };

        populateIdMap();
        expectEachTankIsValid( indicesToSkip );
    };

describe( "Sequentially adding first nine fish tanks - testing absolute values", function(){

    before( function( done ){
        resetFishTanks( 9, done );
    } );

    describe( "Adding first tank", function(){

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[0], function( descriptor ){
                test.tanks[0] = descriptor;
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[1], function( descriptor ){
                test.tanks[1] = descriptor;
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[2], function( descriptor ){
                test.tanks[2] = descriptor;
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[3], function( descriptor ){
                test.tanks[3] = descriptor;
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[4], function( descriptor ){
                test.tanks[4] = descriptor;
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[5], function( descriptor ){
                test.tanks[5] = descriptor;
                test.tanks[4] = test.server.describeFishTankWithId( test.tanks[4].id );
                test.tanks[3] = test.server.describeFishTankWithId( test.tanks[3].id );
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[6], function( descriptor ){
                test.tanks[6] = descriptor;
                test.tanks[5] = test.server.describeFishTankWithId( test.tanks[5].id );
                test.tanks[4] = test.server.describeFishTankWithId( test.tanks[4].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[7], function( descriptor ){
                test.tanks[7] = descriptor;
                test.tanks[6] = test.server.describeFishTankWithId( test.tanks[6].id );
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                done();
            } );
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

        before( function( done ){
            test.server.addFishTankWithSocket( test.sockets[8], function( descriptor ){
                test.tanks[8] = descriptor;
                test.tanks[7] = test.server.describeFishTankWithId( test.tanks[7].id );
                test.tanks[6] = test.server.describeFishTankWithId( test.tanks[6].id );
                test.tanks[3] = test.server.describeFishTankWithId( test.tanks[3].id );
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                done();
            } );
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
            var leftCoords = test.server.describeFishTankWithId( test.tanks[i].left ).coords;
            expect( leftCoords ).to.eql( expectedLeftCoords );
        }
    } );

    it( "checking left neighbours' right links", function(){
        for( var i = 0; i < test.tanks.length; i++ ){
            var left = test.server.describeFishTankWithId( test.tanks[i].left );
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
            var rightCoords = test.server.describeFishTankWithId( test.tanks[i].right ).coords;
            expect( rightCoords ).to.eql( expectedRightCoords );
        }
    } );

    it( "checking right neighbours' left links", function(){
        for( var i = 0; i < test.tanks.length; i++ ){
            var right = test.server.describeFishTankWithId( test.tanks[i].right );
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
            var topCoords = test.server.describeFishTankWithId( test.tanks[i].top ).coords;
            expect( topCoords ).to.eql( expectedTopCoords );
        }
    } );

    it( "checking top neighbours' bottom links", function(){
        for( var i = 0; i < test.tanks.length; i++ ){
            var top = test.server.describeFishTankWithId( test.tanks[i].top );
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
            var bottomCoords = test.server.describeFishTankWithId( test.tanks[i].bottom ).coords;
            expect( bottomCoords ).to.eql( expectedBottomCoords );
        }
    } );

    it( "checking bottom neighbours' top links", function(){
        for( var i = 0; i < test.tanks.length; i++ ){
            var bottom = test.server.describeFishTankWithId( test.tanks[i].bottom );
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
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 0, tankCount: 0} );
            } );
        } );

    } );

    describe( "Add two and remove second tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 2, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 1, tankCount: 1} );
            } );
        } );

        it( "removing second tank results in first having no neighbours", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                expect( test.tanks[0].left ).to.be( null );
                expect( test.tanks[0].right ).to.be( null );
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
            } );
        } );
    } );

    describe( "Add two and remove first tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 2, done );
        } );

        it( "removing first tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 1, tankCount: 1} );
            } );
        } );

        it( "removing first tank results in second having no neighbours", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                expect( test.tanks[1].left ).to.be( null );
                expect( test.tanks[1].right ).to.be( null );
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
            } );
        } );

        it( "removing first tank results in second moving to (0,0)", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                expect( test.tanks[1].coords ).to.eql( {x: 0, y: 0} );
            } );
        } );
    } );

    describe( "Add three and remove third tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 3, done );
        } );

        it( "removing third tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[2], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );
        } );

        it( "removing third tank results in second having no top/bottom neighbours", function(){
            test.server.removeFishTankWithSocket( test.sockets[2], function(){
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                expect( test.tanks[1].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[1].right ).to.equal( test.tanks[0].id );
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
            } );
        } );
    } );

    describe( "Add three and remove second tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 3, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );
        } );

        it( "removing second tank results in third tank moving to (1,0)", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                expect( test.tanks[2].coords ).to.eql( {x: 1, y: 0} );
            } );
        } );

        it( "removing second tank results in third tank linking left/right to first tank", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                expect( test.tanks[2].left ).to.eql( test.tanks[0].id );
                expect( test.tanks[2].right ).to.equal( test.tanks[0].id );
                expect( test.tanks[2].top ).to.be( null );
                expect( test.tanks[2].bottom ).to.be( null );
            } );
        } );
    } );

    describe( "Add three and remove first tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 3, done );
        } );

        it( "removing first tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[2], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 2} );
            } );
        } );

        it( "removing first tank results in results in second tank moving to (0,0)", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                expect( test.tanks[1].coords ).to.eql( {x: 0, y: 0} );
            } );
        } );

        it( "removing first tank results in results in third tank moving to (1,0)", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                expect( test.tanks[2].coords ).to.eql( {x: 1, y: 0} );
            } );
        } );

        it( "removing first tank results in second tank linking left/right to third tank", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                expect( test.tanks[2].left ).to.eql( test.tanks[1].id );
                expect( test.tanks[2].right ).to.equal( test.tanks[1].id );
                expect( test.tanks[2].top ).to.be( null );
                expect( test.tanks[2].bottom ).to.be( null );
            } );
        } );
    } );

    describe( "Add four and remove fourth tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing fourth tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[3], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );
        } );

        it( "removing fourth tank results in first having no up/down neighbours " +
        "and third having no left right neighbours", function(){
            test.server.removeFishTankWithSocket( test.sockets[3], function(){
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                expect( test.tanks[0].top ).to.be( null );
                expect( test.tanks[0].bottom ).to.be( null );
                expect( test.tanks[2].left ).to.be( null );
                expect( test.tanks[2].right ).to.be( null );
            } );
        } );
    } );

    describe( "Add four and remove third tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing fourth tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[2], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );
        } );

        it( "removing third tank results in second having no up/down neighbours " +
        "and fourth having no left right neighbours", function(){
            test.server.removeFishTankWithSocket( test.sockets[2], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                test.tanks[3] = test.server.describeFishTankWithId( test.tanks[3].id );
                expect( test.tanks[1].top ).to.be( null );
                expect( test.tanks[1].bottom ).to.be( null );
                expect( test.tanks[3].left ).to.be( null );
                expect( test.tanks[3].right ).to.be( null );
            } );
        } );
    } );

    describe( "Add four and remove second tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );
        } );

        it( "removing second tank results in third having no up/down neighbours " +
        "and first having no left right neighbours", function(){
            test.server.removeFishTankWithSocket( test.sockets[1], function(){
                test.tanks[0] = test.server.describeFishTankWithId( test.tanks[0].id );
                test.tanks[2] = test.server.describeFishTankWithId( test.tanks[2].id );
                expect( test.tanks[2].top ).to.be( null );
                expect( test.tanks[2].bottom ).to.be( null );
                expect( test.tanks[0].left ).to.be( null );
                expect( test.tanks[0].right ).to.be( null );
            } );
        } );
    } );

    describe( "Add four and remove first tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                expect( test.server.describe() ).to.eql( {gridSize: 2, tankCount: 3} );
            } );
        } );

        it( "removing first tank results in results in second tank moving to (0,0)", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                expect( test.tanks[1].coords ).to.eql( {x: 0, y: 0} );
            } );
        } );

        it( "removing first tank results in results in second tank linking up/down to fourth", function(){
            test.server.removeFishTankWithSocket( test.sockets[0], function(){
                test.tanks[1] = test.server.describeFishTankWithId( test.tanks[1].id );
                test.tanks[3] = test.server.describeFishTankWithId( test.tanks[3].id );
                expect( test.tanks[1].top ).to.eql( test.tanks[3].id );
                expect( test.tanks[1].bottom ).to.eql( test.tanks[3].id );
                expect( test.tanks[1].left ).to.be( null );
                expect( test.tanks[1].right ).to.be( null );
            } );
        } );
    } );
} );

describe( "Deleting from 3x3 grid", function(){

    beforeEach( function( done ){
        repopulateFishTanks( 9, done );
    } );

    it( "removing first tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 0;
        test.server.removeFishTankWithSocket( test.sockets[0], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing second tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 1;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing third tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 2;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing fourth tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 3;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing fifth tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 4;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing sxith tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 5;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing seventh tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 6;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing eighth tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 7;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );

    it( "removing ninth tank leaves no unbroken links and correct metadata", function(){
        var removedIndex = 8;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            refreshTestTanks();
            expectNoBrokenLinks( [removedIndex] );
            expect( test.server.describe() ).to.eql( {gridSize: 3, tankCount: 8} );
        } );
    } );
} );

describe( "Re-adding to a 3x3 grid", function(){

    beforeEach( function( done ){
        repopulateFishTanks( 9, done );
    } );

    it( "remove ninth and re-add", function(){
        var removedIndex = 8;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove eighth and re-add", function(){
        var removedIndex = 7;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove seventh and re-add", function(){
        var removedIndex = 6;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove sixth and re-add", function(){
        var removedIndex = 5;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove fifth and re-add", function(){
        var removedIndex = 4;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove fourth and re-add", function(){
        var removedIndex = 3;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove third and re-add", function(){
        var removedIndex = 2;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove second and re-add", function(){
        var removedIndex = 1;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

    it( "remove first and re-add", function(){
        var removedIndex = 0;
        test.server.removeFishTankWithSocket( test.sockets[removedIndex], function(){
            test.server.addFishTankWithSocket( test.sockets[removedIndex], function(){
                refreshTestTanks();
                expectNoBrokenLinks();
            } );
        } );
    } );

} );
