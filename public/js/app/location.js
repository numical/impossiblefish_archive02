'use strict';
define( ["app/gui"], function( GUI ){

    var
        name = "My Plaice",
        location = "Cyberspace",
        gui = GUI.getLocationDisplay(),

        displayLocation = function(){
            gui.innerHTML = "(" + name + ", " + location + ")";
        },

        initName = function(){
            if( localStorage ) {
                var stored = localStorage.getItem( "name" );
                if ( stored ){
                    name = stored;
                }
            }
        },

        locationFound = function( position ){
            var latitude = position.coords.latitude,
                longitude = position.coords.longitude;
            location = "lat: " + latitude +", long: " + longitude;
            displayLocation();
        },

        locationNotFound = function( positionerror ) {
            switch( positionerror.code ){
                case 1: // PERMISISION DENIED
                    location = "Somewhere Secret";
                    break;
                default:
                    location = "Somewhere Unfindable";
                    break;
            }
            displayLocation();
        },

        initLocation = function(){
            if ( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition(
                    locationFound, locationNotFound );
            }
        };

    initName();
    initLocation();
    displayLocation();
} )
;
