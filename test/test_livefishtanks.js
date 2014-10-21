var expect = require("expect.js"),
    requirejs = require( 'requirejs'),
    messageFactory = null,
    server = null,
    gridSize = null;
    sockets = null,
    fishTank = null,

    resetFishTanks = function( numberOfTanks, done ){

        var calculateGridSize = function( numberOfTanks ){
            var gridWidth = Math.sqrt( numberOfTanks );
            if ( gridWidth*gridWidth !== numberOfTanks ) {
                gridWidth++;
            }
            return gridWidth;
        }

        requirejs.config({
            nodeRequire: require,
            baseUrl: __dirname + '/../public/js/app'
        });

        requirejs(["messagefactory"], function (MessageFactory) {
            server = require('../app_modules/livefishtanks')(MessageFactory);
            messageFactory = MessageFactory;
            gridSize = calculateGridSize( numberOfTanks );
            sockets = [];
            fishTank = [];
            for (var id = 0; id < numberOfTanks; id++) {
                sockets.push({ id: "TEST_SOCKET_" + id });
            }
            done();
        });


    },

    repopulateFishTanks = function( numberOfTanks, done ){
        resetFishTanks( numberOfTanks, function(){
            for ( var i=0 ; i < numberOfTanks; i++ ) {
                server.addFishTankWithSocket( sockets[i], function( descriptor ){
                    fishTank[i] = descriptor;
                } );
            }
            for ( var i=0 ; i < numberOfTanks; i++ ) {
                fishTank[i] = server.describeFishTankWithId( fishTank[i].id );
            }
            done();
        } );
    },

    fail = function(){
        throw new Error("Deliberate Failure");
    };


describe( "Sequentially adding first nine fish tanks - testing absolute values", function(){

    before( function( done ){
        resetFishTanks( 9, done );
    } );

    describe( "Adding first tank", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[0], function( descriptor ){
                fishTank[0] = descriptor;
                done();
            } );
        } );

        it( "first tank should have an id", function(){
            expect( fishTank[0] ).to.be.ok();
            expect( fishTank[0].id ).to.be.ok();
        } );

        it( "first tank should have co-ords of (0,0)", function(){
            expect( fishTank[0].coords).to.eql( { x:0, y:0} );
        } );

        it( "first tank should have no neighbours", function(){
            expect( fishTank[0].left ).to.be( null );
            expect( fishTank[0].right ).to.be( null );
            expect( fishTank[0].top ).to.be( null );
            expect( fishTank[0].bottom ).to.be( null );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 1 );
            expect( meta.gridSize ).to.equal( 1 );
        });
    } );

    describe( "Adding second tank - should go to the right of first tank", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[1], function( descriptor ){
                fishTank[1] = descriptor;
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                done();
            } );
        } );

        it( "second tank should have an id", function(){
            expect( fishTank[1] ).to.be.ok();
            expect( fishTank[1].id ).to.be.ok();
        } );

        it( "second tank should have co-ords of (1,0)", function(){
            expect( fishTank[1].coords).to.eql( { x:1, y:0 } );
        } );

        it( "second tank should have first tank left and right", function(){
            expect( fishTank[1].left ).to.eql( fishTank[0].id );
            expect( fishTank[1].right ).to.eql( fishTank[0].id );
        } );

        it( "second tank should have no tanks top and bottom", function(){
            expect( fishTank[1].top ).to.be( null );
            expect( fishTank[1].bottom ).to.be( null );
        } );

        it( "first tank should have second tank left and right", function(){
            expect( fishTank[0].left ).to.eql( fishTank[1].id );
            expect( fishTank[0].right ).to.eql( fishTank[1].id );
        } );

        it( "first tank should have no tanks top and bottom", function(){
            expect( fishTank[0].top ).to.be( null );
            expect( fishTank[0].bottom ).to.be( null );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 2 );
            expect( meta.gridSize ).to.equal( 2 );
        });
    } );

    describe( "Adding third tank - should go below second tank in a new row", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[2], function( descriptor ){
                fishTank[2] = descriptor;
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                done();
            } );
        } );

        it( "third tank should have an id", function(){
            expect( fishTank[2] ).to.be.ok();
            expect( fishTank[2].id ).to.be.ok();
        } );

        it( "third tank should have co-ords of (1,1)", function(){
            expect( fishTank[2].coords).to.eql( { x:1, y:1 } );
        } );

        it( "third tank should have no tanks left and right", function(){
            expect( fishTank[2].left ).to.be( null );
            expect( fishTank[2].right ).to.be( null );
        } );

        it( "third tank should have second tank top and bottom", function(){
            expect( fishTank[2].top ).to.eql( fishTank[1].id );
            expect( fishTank[2].bottom ).to.eql( fishTank[1].id );
        } );

        it( "second tank should have third tank top and bottom", function(){
            expect( fishTank[1].top ).to.eql( fishTank[2].id );
            expect( fishTank[1].bottom ).to.eql( fishTank[2].id );
        } );

        it( "second tank should have first tank left and right", function(){
            expect( fishTank[1].left ).to.eql( fishTank[0].id );
            expect( fishTank[1].right ).to.eql( fishTank[0].id );
        } );

        it( "first tank should have second tank left and right", function(){
            expect( fishTank[0].left ).to.eql( fishTank[1].id );
            expect( fishTank[0].right ).to.eql( fishTank[1].id );
        } );

        it( "first tank should have no tanks top and bottom", function(){
            expect( fishTank[0].top ).to.be( null );
            expect( fishTank[0].bottom ).to.be( null );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 3 );
            expect( meta.gridSize ).to.equal( 2 );
        });
    } );

    describe( "Adding fourth tank - should go to left of third tank and below first tank", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[3], function( descriptor ){
                fishTank[3] = descriptor;
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                done();
            } );
        } );

        it( "fourth tank should have an id", function(){
            expect( fishTank[3] ).to.be.ok();
            expect( fishTank[3].id ).to.be.ok();
        } );

        it( "fourth tank should have co-ords of (0,1)", function(){
            expect( fishTank[3].coords).to.eql( { x:0, y:1 } );
        } );

        it( "fourth tank should have third tank left and right", function(){
            expect( fishTank[3].left ).to.eql( fishTank[2].id );
            expect( fishTank[3].right ).to.eql( fishTank[2].id );
        } );

        it( "fourth tank should have first tank top and bottom", function(){
            expect( fishTank[3].top ).to.eql( fishTank[0].id );
            expect( fishTank[3].bottom ).to.eql( fishTank[0].id );
        } );

        it( "third tank should have fourth tank left and right", function(){
            expect( fishTank[2].left ).to.eql( fishTank[3].id );
            expect( fishTank[2].right ).to.eql( fishTank[3].id );
        } );

        it( "third tank should have second fish tank top and bottom", function(){
            expect( fishTank[2].top ).to.eql( fishTank[1].id );
            expect( fishTank[2].bottom ).to.eql( fishTank[1].id );
        } );

        it( "second tank should have third fish tank top and bottom", function(){
            expect( fishTank[1].top ).to.eql( fishTank[2].id );
            expect( fishTank[1].bottom ).to.eql( fishTank[2].id );
        } );

        it( "second tank should have first fish tank left and right", function(){
            expect( fishTank[1].left ).to.eql( fishTank[0].id );
            expect( fishTank[1].right ).to.eql( fishTank[0].id );
        } );

        it( "first tank should have second fish tank left and right", function(){
            expect( fishTank[0].left ).to.eql( fishTank[1].id );
            expect( fishTank[0].right ).to.eql( fishTank[1].id );
        } );

        it( "first tank should have fourth tank top and bottom", function(){
            expect( fishTank[0].top ).to.eql( fishTank[3].id );
            expect( fishTank[0].bottom ).to.eql( fishTank[3].id );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 4 );
            expect( meta.gridSize ).to.equal( 2 );
        });
    } );

    describe( "Adding fifth tank - should go to right of second tank in new column", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[4], function( descriptor ){
                fishTank[4] = descriptor;
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                done();
            } );
        } );

        it( "fifth tank should have an id", function(){
            expect( fishTank[4] ).to.be.ok();
            expect( fishTank[4].id ).to.be.ok();
        } );

        it( "fifth tank should have co-ords of (2,0)", function(){
            expect( fishTank[4].coords).to.eql( { x:2, y:0 } );
        } );

        it( "fifth tank should have second tank to left", function(){
            expect( fishTank[4].left ).to.eql( fishTank[1].id );
        } );

        it( "fifth tank should have first tank to right", function(){
            expect( fishTank[4].right ).to.eql( fishTank[0].id );
        } );

        it( "fifth tank should have no tanks top and bottom", function(){
            expect( fishTank[4].top ).to.be( null );
            expect( fishTank[4].bottom ).to.be( null );
        } );

        it( "first tank should have fifth tank to left (looped)", function(){
            expect( fishTank[0].left ).to.eql( fishTank[4].id );
        } );

        it( "second tank should have fifth tank to right", function(){
            expect( fishTank[1].right ).to.eql( fishTank[4].id );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 5 );
            expect( meta.gridSize ).to.equal( 3 );
        });

    } );

    describe( "Adding sixth tank - should go below fifth tank, to right of third tank", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[5], function( descriptor ){
                fishTank[5] = descriptor;
                fishTank[4] = server.describeFishTankWithId( fishTank[4].id );
                fishTank[3] = server.describeFishTankWithId( fishTank[3].id );
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                done();
            } );
        } );

        it( "sixth tank should have an id", function(){
            expect( fishTank[5] ).to.be.ok();
            expect( fishTank[5].id ).to.be.ok();
        } );

        it( "sixth tank should have co-ords of (2,1)", function(){
            expect( fishTank[5].coords).to.eql( { x:2, y:1 } );
        } );

        it( "sixth tank should have third tank to left", function(){
            expect( fishTank[5].left ).to.eql( fishTank[2].id );
        } );

        it( "sixth tank should have fourth tank to right (looped)", function(){
            expect( fishTank[5].right ).to.eql( fishTank[3].id );
        } );

        it( "sixth tank should have fifth tank to top and bottom", function(){
            expect( fishTank[5].top ).to.eql( fishTank[4].id );
            expect( fishTank[5].bottom ).to.eql( fishTank[4].id );
        } );

        it( "fifth tank should have sixth tank to top and bottom", function(){
            expect( fishTank[4].top ).to.eql( fishTank[5].id );
            expect( fishTank[4].bottom ).to.eql( fishTank[5].id );
        } );

        it( "fourth tank should have sixth tank to left (looped)", function(){
            expect( fishTank[3].left ).to.eql( fishTank[5].id );
        } );

        it( "third tank should have sixth tank to right", function(){
            expect( fishTank[2].right ).to.eql( fishTank[5].id );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 6 );
            expect( meta.gridSize ).to.equal( 3 );
        });

    } );

    describe( "Adding seventh tank - should go below sixth tank, on a new row", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[6], function( descriptor ){
                fishTank[6] = descriptor;
                fishTank[5] = server.describeFishTankWithId( fishTank[5].id );
                fishTank[4] = server.describeFishTankWithId( fishTank[4].id );
                done();
            } );
        } );

        it( "seventh tank should have an id", function(){
            expect( fishTank[6] ).to.be.ok();
            expect( fishTank[6].id ).to.be.ok();
        } );

        it( "seventh tank should have co-ords of (2,2)", function(){
            expect( fishTank[6].coords).to.eql( { x:2, y:2 } );
        } );

        it( "seventh tank should have no tanks left or right", function(){
            expect( fishTank[6].left ).to.be( null );
            expect( fishTank[6].right ).to.be( null );
        } );

        it( "seventh tank should sixth tank to top", function(){
            expect( fishTank[6].top ).to.eql( fishTank[5].id );
        } );

        it( "seventh tank should fifth tank to bottom (looped)", function(){
            expect( fishTank[6].bottom ).to.eql( fishTank[4].id );
        } );

        it( "sixth tank should have seventh tank to bottom", function(){
            expect( fishTank[5].bottom ).to.eql( fishTank[6].id );
        } );

        it( "fifth tank should have seventh tank to top", function(){
            expect( fishTank[4].top ).to.eql( fishTank[6].id );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 7 );
            expect( meta.gridSize ).to.equal( 3 );
        });

    } );

    describe( "Adding eighth tank - should go below third tank, to the left of the seventh", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[7], function( descriptor ){
                fishTank[7] = descriptor;
                fishTank[6] = server.describeFishTankWithId( fishTank[6].id );
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                done();
            } );
        } );

        it( "eighth tank should have an id", function(){
            expect( fishTank[7] ).to.be.ok();
            expect( fishTank[7].id ).to.be.ok();
        } );

        it( "eighth tank should have co-ords of (1,2)", function(){
            expect( fishTank[7].coords).to.eql( { x:1, y:2 } );
        } );

        it( "eighth tank should third tank to top", function(){
            expect( fishTank[7].top ).to.eql( fishTank[2].id );
        } );

        it( "eighth tank should second tank to bottom (looped)", function(){
            expect( fishTank[7].bottom ).to.eql( fishTank[1].id );
        } );

        it( "eighth tank should seventh tank to the left and right", function(){
            expect( fishTank[7].left ).to.eql( fishTank[6].id );
            expect( fishTank[7].right ).to.eql( fishTank[6].id );
        } );

        it( "second tank should have eighth tank to top", function(){
            expect( fishTank[1].top ).to.eql( fishTank[7].id );
        } );

        it( "third tank should have eighth tank to bottom", function(){
            expect( fishTank[2].bottom ).to.eql( fishTank[7].id );
        } );

        it( "seventh tank should eighth tank to the left and right", function(){
            expect( fishTank[6].left ).to.eql( fishTank[7].id );
            expect( fishTank[6].right ).to.eql( fishTank[7].id );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 8 );
            expect( meta.gridSize ).to.equal( 3 );
        });

    } );

    describe( "Adding ninth tank - should go below fourth tank, to the left of the eighth", function(){

        before( function( done ){
            server.addFishTankWithSocket( sockets[8], function( descriptor ){
                fishTank[8] = descriptor;
                fishTank[7] = server.describeFishTankWithId( fishTank[7].id );
                fishTank[6] = server.describeFishTankWithId( fishTank[6].id );
                fishTank[3] = server.describeFishTankWithId( fishTank[3].id );
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                done();
            } );
        } );

        it( "ninth tank should have an id", function(){
            expect( fishTank[8] ).to.be.ok();
            expect( fishTank[8].id ).to.be.ok();
        } );

        it( "ninth tank should have co-ords of (0,2)", function(){
            expect( fishTank[8].coords).to.eql( { x:0, y:2 } );
        } );

        it( "ninth tank should fourth tank to top", function(){
            expect( fishTank[8].top ).to.eql( fishTank[3].id );
        } );

        it( "ninth tank should first tank to bottom (looped)", function(){
            expect( fishTank[8].bottom ).to.eql( fishTank[0].id );
        } );

        it( "ninth tank should eighth tank to right", function(){
            expect( fishTank[8].right ).to.eql( fishTank[7].id );
        } );

        it( "ninth tank should seventh tank to left (looped)", function(){
            expect( fishTank[8].left ).to.eql( fishTank[6].id );
        } );

        it( "first tank should have ninth tank to top", function(){
            expect( fishTank[0].top ).to.eql( fishTank[8].id );
        } );

        it( "fourth tank should have ninth tank to bottom", function(){
            expect( fishTank[3].bottom ).to.eql( fishTank[8].id );
        } );

        it( "seventh tank should ninth tank to the right", function(){
            expect( fishTank[6].right ).to.eql( fishTank[8].id );
        } );

        it( "eighth tank should ninth tank to the left", function(){
            expect( fishTank[7].left ).to.eql( fishTank[8].id );
        } );

        it( "tanks description is correct", function(){
            var meta = server.describe();
            expect( meta.tankCount ).to.equal( 9 );
            expect( meta.gridSize ).to.equal( 3 );
        });

    } );

} );

describe( "Sequentially adding first 1024 fish tanks - no gaps - testing relative values", function(){

    before( function( done ){
        var gridSize = 32;
        repopulateFishTanks( gridSize * gridSize , done );
    } );

    it( "there should be (grid size) squared tanks", function(){
        var meta = server.describe();
        expect( meta.gridSize ).to.equal( gridSize );
        expect( meta.tankCount ).to.equal( gridSize * gridSize );
    });

    it( "checking left neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedLeftCoords = {
                x:  ( coords.x === 0 ) ? gridSize - 1 : coords.x - 1,
                y: coords.y };
            var leftCoords = server.describeFishTankWithId( fishTank[i].left ).coords;
            expect( leftCoords ).to.eql( expectedLeftCoords );
        }
    });

    it( "checking left neighbours' right links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var left = server.describeFishTankWithId( fishTank[i].left );
            expect( left.right ).to.equal( fishTank[i].id );
        }
    });

    it( "checking right neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedRightCoords = {
                x:  ( coords.x === gridSize - 1 ) ? 0 : coords.x + 1,
                y: coords.y };
            var rightCoords = server.describeFishTankWithId( fishTank[i].right ).coords;
            expect( rightCoords ).to.eql( expectedRightCoords );
        }
    });

    it( "checking right neighbours' left links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var right = server.describeFishTankWithId( fishTank[i].right );
            expect( right.left ).to.equal( fishTank[i].id );
        }
    });

    it( "checking top neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedTopCoords = {
                x:  coords.x,
                y: ( coords.y === 0 ) ? gridSize - 1 : coords.y - 1 };
            var topCoords = server.describeFishTankWithId( fishTank[i].top ).coords;
            expect( topCoords ).to.eql( expectedTopCoords );
        }
    });

    it( "checking top neighbours' bottom links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var top = server.describeFishTankWithId( fishTank[i].top );
            expect( top.bottom ).to.equal( fishTank[i].id );
        }
    });

    it( "checking bottom neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedBottomCoords = {
                x:  coords.x,
                y: ( coords.y === gridSize - 1 ) ? 0 : coords.y + 1 };
            var bottomCoords = server.describeFishTankWithId( fishTank[i].bottom ).coords;
            expect( bottomCoords ).to.eql( expectedBottomCoords );
        }
    });

    it( "checking bottom neighbours' top links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var bottom = server.describeFishTankWithId( fishTank[i].bottom );
            expect( bottom.top ).to.equal( fishTank[i].id );
        }
    });
})

describe( "Deleting from small grid", function(){

    describe( "Add and remove single tank", function(){

        before( function( done ){
            repopulateFishTanks( 1, done );
        } );

        it( "removing tank reverts to initial state", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 0 );
                expect( meta.tankCount ).to.equal( 0 );
            });
        } );

    });

    describe( "Add two and remove second tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 2, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 1 );
                expect( meta.tankCount ).to.equal( 1 );
            });
        } );

        it( "removing second tank results in first having no neighbours", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                expect( fishTank[0].left ).to.be( null );
                expect( fishTank[0].right ).to.be( null );
                expect( fishTank[0].top ).to.be( null );
                expect( fishTank[0].bottom ).to.be( null );
            });
        } );
    });

    describe( "Add two and remove first tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 2, done );
        } );

        it( "removing first tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 1 );
                expect( meta.tankCount ).to.equal( 1 );
            });
        } );

        it( "removing first tank results in second having no neighbours", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                expect( fishTank[1].left ).to.be( null );
                expect( fishTank[1].right ).to.be( null );
                expect( fishTank[1].top ).to.be( null );
                expect( fishTank[1].bottom ).to.be( null );
            });
        } );

        it( "removing first tank results in second moving to (0,0)", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                expect( fishTank[1].coords ).to.eql( { x:0,y:0 } );
            });
        } );
    });

    describe( "Add three and remove third tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 3, done );
        } );

        it( "removing third tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[2], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 2 );
            });
        } );

        it( "removing third tank results in second having no top/bottom neighbours", function(){
            server.removeFishTankWithSocket( sockets[2], function(){
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                expect( fishTank[1].left ).to.eql( fishTank[0].id );
                expect( fishTank[1].right ).to.equal( fishTank[0].id );
                expect( fishTank[1].top ).to.be( null );
                expect( fishTank[1].bottom ).to.be( null );
            });
        } );
    });

    describe( "Add three and remove second tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 3, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 2 );
            });
        } );

        it( "removing second tank results in third tank moving to (1,0)", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                expect( fishTank[2].coords ).to.eql( { x:1,y:0 } );
            });
        } );

        it( "removing second tank results in third tank linking left/right to first tank", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                expect( fishTank[2].left ).to.eql( fishTank[0].id );
                expect( fishTank[2].right ).to.equal( fishTank[0].id );
                expect( fishTank[2].top ).to.be( null );
                expect( fishTank[2].bottom ).to.be( null );
            });
        } );
    });

    describe( "Add three and remove first tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 3, done );
        } );

        it( "removing first tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[2], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 2 );
            });
        } );

        it( "removing first tank results in results in second tank moving to (0,0)", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                expect( fishTank[1].coords ).to.eql( { x:0,y:0 } );
            });
        } );

        it( "removing first tank results in results in third tank moving to (1,0)", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                expect( fishTank[2].coords ).to.eql( { x:1,y:0 } );
            });
        } );

        it( "removing first tank results in second tank linking left/right to third tank", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                expect( fishTank[2].left ).to.eql( fishTank[1].id );
                expect( fishTank[2].right ).to.equal( fishTank[1].id );
                expect( fishTank[2].top ).to.be( null );
                expect( fishTank[2].bottom ).to.be( null );
            });
        } );
    });

    describe( "Add four and remove fourth tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing fourth tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[3], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 3 );
            });
        } );

        it( "removing fourth tank results in first having no up/down neighbours " +
                "and third having no left right neighbours", function(){
            server.removeFishTankWithSocket( sockets[3], function(){
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                expect( fishTank[0].top ).to.be( null );
                expect( fishTank[0].bottom ).to.be( null );
                expect( fishTank[2].left ).to.be( null );
                expect( fishTank[2].right ).to.be( null );
            });
        } );
    });

    describe( "Add four and remove third tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing fourth tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[2], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 3 );
            });
        } );

        it( "removing third tank results in second having no up/down neighbours " +
                "and fourth having no left right neighbours", function(){
            server.removeFishTankWithSocket( sockets[2], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                fishTank[3] = server.describeFishTankWithId( fishTank[3].id );
                expect( fishTank[1].top ).to.be( null );
                expect( fishTank[1].bottom ).to.be( null );
                expect( fishTank[3].left ).to.be( null );
                expect( fishTank[3].right ).to.be( null );
            });
        } );
    });

    describe( "Add four and remove second tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 3 );
            });
        } );

        it( "removing second tank results in third having no up/down neighbours " +
                "and first having no left right neighbours", function(){
            server.removeFishTankWithSocket( sockets[1], function(){
                fishTank[0] = server.describeFishTankWithId( fishTank[0].id );
                fishTank[2] = server.describeFishTankWithId( fishTank[2].id );
                expect( fishTank[2].top ).to.be( null );
                expect( fishTank[2].bottom ).to.be( null );
                expect( fishTank[0].left ).to.be( null );
                expect( fishTank[0].right ).to.be( null );
            });
        } );
    });

    describe( "Add four and remove first tank", function(){

        beforeEach( function( done ){
            repopulateFishTanks( 4, done );
        } );

        it( "removing second tank results in corrected tanks description", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                var meta = server.describe();
                expect( meta.gridSize ).to.equal( 2 );
                expect( meta.tankCount ).to.equal( 3 );
            });
        } );

        it( "removing first tank results in results in second tank moving to (0,0)", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                expect( fishTank[1].coords ).to.eql( { x:0,y:0 } );
            });
        } );

        it( "removing first tank results in results in second tank linking up/down to fourth", function(){
            server.removeFishTankWithSocket( sockets[0], function(){
                fishTank[1] = server.describeFishTankWithId( fishTank[1].id );
                fishTank[3] = server.describeFishTankWithId( fishTank[3].id );
                expect( fishTank[1].top ).to.eql( fishTank[3].id );
                expect( fishTank[1].bottom ).to.eql( fishTank[3].id );
                expect( fishTank[1].left ).to.be( null );
                expect( fishTank[1].right ).to.be( null );
            });
        } );
    });
} );