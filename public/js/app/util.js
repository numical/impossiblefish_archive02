/*
General purpose utilities module.
 */

define({

    // random number utility
    random: function( min, max ) {
        return min + Math.floor( (max-min) * Math.random() );
    },

    // random number utility - ensures an integer returned
    // - see http://www.html5rocks.com/en/tutorials/canvas/performance/#toc-avoid-float
    randomInt: function( min, max ) {
        return ( min + Math.floor( (max-min) * Math.random() ) + 0.5 ) | 0 ;
    },

    fadeOut: function(element, maxOpacity ) {
        if ( !element.fading ) {
            element.fading = "out";
            var op = parseFloat( element.style.opacity );
            var timer = setInterval(function () {
                if (op <= 0.0){
                    clearInterval(timer);
                    element.fading = null;
                    op = 0;
                } else {
                    op -= 0.1;
                }
                element.style.opacity = op;
            }, 50);
        }
    },

    fadeIn: function(element, maxOpacity ) {
        if ( !element.fading ) {
            element.fading = "in";
            var op = parseFloat(element.style.opacity);
            var timer = setInterval(function () {
                if (op >= maxOpacity) {
                    clearInterval(timer);
                    element.fading = null;
                } else {
                    op += 0.1;
                }
                element.style.opacity = op;
            }, 50);
        }
    }
});




