/**
 * All messages created via this factory for homogeneity
 */

define( function(){

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

        FishDescriptor: function( xRelative, yRelative, rotation ){
            this.xRelative = xRelative;
            this.yRelative = yRelative;
            this.rotation = rotation
        }
    }

});