/*
A miscellany of utilities until I decide on a framework to use.
 */
'use strict';

define( function(){

    var PARAM_REGEX = {
        PREFIX: "[\\?\\&]",
        SUFFIX: "=([^\\&]*)(\\&?)",
        CASE_INSENSITIVE: "i"
    };

    return {
        // random number utility
        random: function( min, max ){
            return min + Math.floor( (max - min) * Math.random() );
        },


        /*
        // random number utility - ensures an integer returned
        // - see http://www.html5rocks.com/en/tutorials/canvas/performance/#toc-avoid-float
        randomInt: function( min, max ){
            return ( min + Math.floor( (max - min) * Math.random() ) + 0.5 ) | 0;
        },
        */

        // GUI fade
        fadeOut: function( element ){
            if( !element.fading ){
                element.fading = "out";
                var op = parseFloat( element.style.opacity ),
                    timer = setInterval( function(){
                        if( op <= 0.0 ){
                            clearInterval( timer );
                            element.fading = null;
                            op = 0;
                        } else{
                            op -= 0.1;
                        }
                        element.style.opacity = op;
                    }, 50 );
            }
        },

        // GUI fade
        fadeIn: function( element, maxOpacity ){
            if( !element.fading ){
                element.fading = "in";
                var op = parseFloat( element.style.opacity ),
                    timer = setInterval( function(){
                        if( op >= maxOpacity ){
                            clearInterval( timer );
                            element.fading = null;
                        } else{
                            op += 0.1;
                        }
                        element.style.opacity = op;
                    }, 50 );
            }
        },

        // extract URL parameters
        getURLParameter: function( key ){
            var value = location.search.match( new RegExp(
                PARAM_REGEX.PREFIX + key + PARAM_REGEX.SUFFIX,
                PARAM_REGEX.CASE_INSENSITIVE ) );
            return value ? value[1] : value;
        }
    };
});




