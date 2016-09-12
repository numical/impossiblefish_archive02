/*jslint nomen: true */
/*global describe, it, before, after */
'use strict';
var expect = require( "expect.js" ),
    requirejs = require( 'requirejs' ),

    test = {
        geocoder: null
    };

describe( "Testing geocoding ...", function() {
    before(function (done) {
        requirejs.config({
            nodeRequire: require,
            baseUrl: __dirname + '/../public/js/app'
        });

        requirejs(["messages"], function (Messages) {
            test.geocoder = require('../app_modules/geocoding')(Messages);
            done();
        });
    });

    describe( "Has conversion method", function(){
        expect( test.geocoder ).to.be.ok();
        expect ( test.geocoder.convertLatLongToAddress ).to.be.ok();
    } );
} );

