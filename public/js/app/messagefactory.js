/**
 * All messages created via this factory for homogeneity
 */

define( function(){

    function FishTankDescriptor(id,x,y){
        this.id = id;
        this.coords = { x: x, y: y };
        // neighbouring fishtanks - recursive use of this function
        this.left = null;
        this.right = null;
        this.top = null;
        this.bottom = null;
    }

    return {

        REQUEST_FISHTANK_DESCRIPTOR: "requestFishTankDescriptor",

        createFishTankDescriptor: function( id,x, y ) {
            return new FishTankDescriptor( id, x, y );
        }
    }

});