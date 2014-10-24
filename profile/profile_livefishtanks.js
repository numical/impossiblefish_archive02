var requirejs = require( 'requirejs' ),
    server = null,
    numberOfTanks = 25,
    sockets = [],

    init = function( done ){

        requirejs.config( {
            nodeRequire: require,
            baseUrl: __dirname + '/../public/js/app'
        } );

        requirejs( ["messagefactory"], function( MessageFactory ){
            server = require( '../app_modules/livefishtanks' )( MessageFactory );

            for( var id = 0; id < numberOfTanks; id++ ){
                sockets.push( {id: "TEST_SOCKET_" + id} );
            };

            for( var i = 0; i < numberOfTanks; i++ ){
                server.addFishTankWithSocket( sockets[i], function( descriptor ){
                } );
            }

            done()
        } );
    }

    testLoop = function(){
        iteration = 0,
         setInterval( function(){
         console.log("interation" + ++iteration );
         testFunction();
         }, 1000 );
    },

    testFunction = function(){
        for( var removedIndex = 0 ; removedIndex < numberOfTanks; removedIndex++ ){
            server.removeFishTankWithSocket( sockets[removedIndex], function(){
                server.addFishTankWithSocket( sockets[removedIndex], function(){
                } );
            } );
        }
    };


init( testLoop );



