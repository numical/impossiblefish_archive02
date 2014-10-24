/**
 * All messages created via this factory for homogeneity
 */

define( function(){

    return {

        TANK_UPDATE: "TANK_UPDATE",

        TankDescriptor: function(id,x,y,left,right,top,bottom){
            this.id = id;
            this.coords = {x: x, y: y};
            // neighbouring fishtanks - recursive use of this function
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
        }

    }

});