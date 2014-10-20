var expect = require("expect.js"),
    requirejs = require( 'requirejs'),
    messageFactory = null,
    server = null,
    gridSize = null;
    sockets = null,
    fishTank = null,

    resetFishTanks = function( gridWidth, done ){

        requirejs.config({
            nodeRequire: require,
            baseUrl: __dirname + '/../public/js/app'
        });

        requirejs(["messagefactory"], function (MessageFactory) {
            server = require('../app_modules/livefishtanks')(MessageFactory);
            messageFactory = MessageFactory;
            gridSize = gridWidth;
            sockets = [];
            fishTank = [];
            for (var id = 0; id < gridSize*gridSize; id++) {
                sockets.push({ id: "TEST_SOCKET_" + id });
            }
            done();
        })
    };


describe( "Sequentially adding first nine fish tanks - testing absolute values", function(){

    before( function( done ){
        resetFishTanks( 3, done );
    } );

    describe( "Adding first tank", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[0], function( descriptor ){
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
    } );

    describe( "Adding second tank - should go to the right of first tank", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[1], function( descriptor ){
                fishTank[1] = descriptor;
                fishTank[0] = server.getFishTankDescriptor( fishTank[0].id );
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
    } );

    describe( "Adding third tank - should go below second tank in a new row", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[2], function( descriptor ){
                fishTank[2] = descriptor;
                fishTank[1] = server.getFishTankDescriptor( fishTank[1].id );
                fishTank[0] = server.getFishTankDescriptor( fishTank[0].id );
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
    } );

    describe( "Adding fourth tank - should go to left of third tank and below first tank", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[3], function( descriptor ){
                fishTank[3] = descriptor;
                fishTank[2] = server.getFishTankDescriptor( fishTank[2].id );
                fishTank[1] = server.getFishTankDescriptor( fishTank[1].id );
                fishTank[0] = server.getFishTankDescriptor( fishTank[0].id );
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
    } );

    describe( "Adding fifth tank - should go to right of second tank in new column", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[4], function( descriptor ){
                fishTank[4] = descriptor;
                fishTank[1] = server.getFishTankDescriptor( fishTank[1].id );
                fishTank[0] = server.getFishTankDescriptor( fishTank[0].id );
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

    } );

    describe( "Adding sixth tank - should go below fifth tank, to right of third tank", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[5], function( descriptor ){
                fishTank[5] = descriptor;
                fishTank[4] = server.getFishTankDescriptor( fishTank[4].id );
                fishTank[3] = server.getFishTankDescriptor( fishTank[3].id );
                fishTank[2] = server.getFishTankDescriptor( fishTank[2].id );
                fishTank[0] = server.getFishTankDescriptor( fishTank[0].id );
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

    } );

    describe( "Adding seventh tank - should go below sixth tank, on a new row", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[6], function( descriptor ){
                fishTank[6] = descriptor;
                fishTank[5] = server.getFishTankDescriptor( fishTank[5].id );
                fishTank[4] = server.getFishTankDescriptor( fishTank[4].id );
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

    } );

    describe( "Adding eighth tank - should go below third tank, to the left of the seventh", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[7], function( descriptor ){
                fishTank[7] = descriptor;
                fishTank[6] = server.getFishTankDescriptor( fishTank[6].id );
                fishTank[2] = server.getFishTankDescriptor( fishTank[2].id );
                fishTank[1] = server.getFishTankDescriptor( fishTank[1].id );
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

    } );

    describe( "Adding ninth tank - should go below fourth tank, to the left of the eighth", function(){

        before( function( done ){
            server.addFishTankOnSocket( sockets[8], function( descriptor ){
                fishTank[8] = descriptor;
                fishTank[7] = server.getFishTankDescriptor( fishTank[7].id );
                fishTank[6] = server.getFishTankDescriptor( fishTank[6].id );
                fishTank[3] = server.getFishTankDescriptor( fishTank[3].id );
                fishTank[0] = server.getFishTankDescriptor( fishTank[0].id );
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

    } );

} );

describe( "Sequentially adding first 1024 fish tanks - no gaps - testing relative values", function(){

    this.timeout( 5000 );

    before( function( done ){
        gridSize = 32;
        resetFishTanks( gridSize, function(){
            for ( var i=0 ; i < gridSize * gridSize; i++ ) {
                server.addFishTankOnSocket( sockets[i], function( descriptor ){
                    fishTank[i] = descriptor;
                } );
            }
            for ( var i=0 ; i < gridSize * gridSize; i++ ) {
                fishTank[i] = server.getFishTankDescriptor( fishTank[i].id );
            }
            done();
        } );
    } );

    it( "there should be (grid size) squared tanks", function(){
        expect ( fishTank.length ).to.equal( gridSize * gridSize );
    } );

    it( "checking left neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedLeftCoords = {
                x:  ( coords.x === 0 ) ? gridSize - 1 : coords.x - 1,
                y: coords.y };
            var leftCoords = server.getFishTankDescriptor( fishTank[i].left ).coords;
            expect( leftCoords ).to.eql( expectedLeftCoords );
        }
    });

    it( "checking left neighbours' right links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var left = server.getFishTankDescriptor( fishTank[i].left );
            expect( left.right ).to.equal( fishTank[i].id );
        }
    });

    it( "checking right neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedRightCoords = {
                x:  ( coords.x === gridSize - 1 ) ? 0 : coords.x + 1,
                y: coords.y };
            var rightCoords = server.getFishTankDescriptor( fishTank[i].right ).coords;
            expect( rightCoords ).to.eql( expectedRightCoords );
        }
    });

    it( "checking right neighbours' left links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var right = server.getFishTankDescriptor( fishTank[i].right );
            expect( right.left ).to.equal( fishTank[i].id );
        }
    });

    it( "checking top neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedTopCoords = {
                x:  coords.x,
                y: ( coords.y === 0 ) ? gridSize - 1 : coords.y - 1 };
            var topCoords = server.getFishTankDescriptor( fishTank[i].top ).coords;
            expect( topCoords ).to.eql( expectedTopCoords );
        }
    });

    it( "checking top neighbours' bottom links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var top = server.getFishTankDescriptor( fishTank[i].top );
            expect( top.bottom ).to.equal( fishTank[i].id );
        }
    });

    it( "checking bottom neighbours' coordinates", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var coords = fishTank[i].coords;
            var expectedBottomCoords = {
                x:  coords.x,
                y: ( coords.y === gridSize - 1 ) ? 0 : coords.y + 1 };
            var bottomCoords = server.getFishTankDescriptor( fishTank[i].bottom ).coords;
            expect( bottomCoords ).to.eql( expectedBottomCoords );
        }
    });

    it( "checking bottom neighbours' top links", function(){
        for ( var i = 0 ; i < fishTank.length; i ++){
            var bottom = server.getFishTankDescriptor( fishTank[i].bottom );
            expect( bottom.top ).to.equal( fishTank[i].id );
        }
    });
})
