/**
 * All messages created via this factory for homogeneity
 */

define( function(){

    function FishtankMetadata(id){
        this.id = id;

        // neighbouring fishtanks - recursive use of this function
        this.left = null;
        this.right = null;
        this.top = null;
        this.bottom = null;
    }

    return {

        REQUEST_FISHTANK_METADATA: "requestFishtankMetadata",

        createFishtankMetadata: function( id ) {
            return new FishtankMetadata( id );
        }
    }

});