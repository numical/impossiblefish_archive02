/**
 * All messages created via this factory for homogeneity
 */

define( function(){
    'use strict';
    return {

        TANK_UPDATE: "TANK UPDATE",

        TankDescriptor: function(id,coords,left,right,top,bottom){
            this.id = id;
            this.coords = coords;
            // neighbouring fishtanks or their id's
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
        },

        FISH_TELEPORT: "FISH TELEPORT",

        FishDescriptor: function( meme, xRelative, yRelative, rotation ){
            this.meme = meme;
            this.xRelative = xRelative;
            this.yRelative = yRelative;
            this.rotation = rotation;
        }
    };
});