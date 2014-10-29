/**
 * Parasitic combination inheritance (!)
 * - uses constructor stealing to inherit properties
 * - uses parasitic inheritance to inherit behaviour
 * - protottype chain intact so instanceOf and isPrototypeOf work
 * @param inheriting
 * @param inheritFrom
 * @param includeOwnProperties
 */

module.exports.inheritPrototype = function( inheriting, inheritedFrom, includeOwnProperties ){

    // create prototype object with specific [[Prototype]]
    var proto = Object.create( inheritedFrom.prototype );

    // else constructor lost when prototype overwritten
    proto.constructor = inheriting;

    // copy inheritedFrom's own properties
    if ( includeOwnProperties ) {
        Object.getOwnPropertyNames( inheritedFrom ).forEach(function( propertyKey ) {
            var description = Object.getOwnPropertyDescriptor( inheritedFrom, propertyKey );
            if ( !proto.hasOwnProperty( propertyKey ) ) {
                Object.defineProperty( proto, propertyKey, description );
            }
        });
    }
    inheriting.prototype = proto;
};

module.exports.newEquivalent = function( Type ){

    var object = Object.create( Type.prototype );
    var  instance = Type.call( object );
    if ( !instance ) {
        instance = object;
    }
    return instance;
}