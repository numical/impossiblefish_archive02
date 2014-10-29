var expect = require( "expect.js" ),
    Util = require( '../app_modules/inheritance' ),
    METHOD = "growSeeds",
    PROPERTY = "fruitiness",
    NEW_PROPERTY = "iamafruit",
    Fruit = function(){},
    Apple = function(){};

// NB: Object.[[Prototype]] and Object.prototype are different things!
describe( "Understanding inheritance ...", function(){

    beforeEach( function(){
        Fruit[METHOD] = function(){};
        Fruit[PROPERTY] = {};
    } );

    afterEach( function(){
        Fruit = function(){};
        Apple = function(){};
    } );

    describe("Basic understanding of prototypical inheritance...", function() {

        it( "Test object has test property", function(){
            expect( Fruit ).to.have.property( METHOD );
        } );

        it( "Object.create() directly sets [[Prototype]] value to argument", function(){
            var fruit = Object.create( Fruit );
            expect( Object.getPrototypeOf( fruit ) ).to.be( Fruit );
        } );

        it( "Object.create() results in created object having passed objects properties", function(){
            var fruit = Object.create( Fruit );
            expect( fruit ).to.have.property( METHOD );
            expect( fruit ).to.have.property( PROPERTY );
            expect( Fruit[METHOD] ).to.be( fruit[METHOD] );
            expect( Fruit[PROPERTY] ).to.be( fruit[PROPERTY] );
        } );

        it ( "created object shadows parent object properties", function(){
            var fruit = Object.create( Fruit );
            fruit[PROPERTY] = {};
            expect( fruit[PROPERTY] ).not.to.be( Fruit[PROPERTY] );
        });

        it( "Object.create() does support isPrototypeOf ", function(){
            var fruit = Object.create( Fruit );
            expect( Fruit.isPrototypeOf( fruit ) ).to.be.ok();
        } );

        it( "Default prototype property is empty object", function(){
            expect( Object.getPrototypeOf( Fruit )).to.eql( {} );
        } );

        it( "Default prototype property has constructor of object", function(){
            expect( Fruit.prototype.constructor).to.eql( Fruit );
        } );

        it( "Object.create() leaves default prototype property", function(){
            var fruit = Object.create( Fruit );
            expect( fruit.prototype ).to.eql( {} );
        } );

        // instanceof based on recursive object.[[Prototype]] === Object.prototype
        it( "Hence Object.create() does not support instanceof", function(){
            var fruit = Object.create( Fruit );
            expect( fruit ).not.to.be.a( Fruit );
        } );

        it( "Can force instanceof to work by manipulating parent prototype property (yuk)", function(){
            var Vegetable = function(){};
            var veg = Object.create( Vegetable );
            Vegetable.prototype = Vegetable;
            expect( veg ).to.be.a( Vegetable )
        } );
    });

    describe("Basic understanding of pseudo-Classical inheritance using Util.inheritFrom() and new constructors...", function(){

        describe("instanceOf test - (X.prototype in x.[[Prototype]].[[Prototype]].. chain", function(){

            beforeEach( function(){
                Util.inheritPrototype( Apple, Fruit );
            } );

            it( "apple instance of Apple", function(){
                var apple = new Apple();
                expect( apple ).to.be.an( Apple );
            } );

            it( "because Apple prototype is in [[Prototype]].[[Prototype]].. chain of apple", function(){
                var apple = new Apple();
                expect( Apple.prototype.isPrototypeOf( apple ) ).to.be.ok();
            } );

            it( "apple instance of Fruit", function(){
                var apple = new Apple();
                expect( apple ).to.be.a( Fruit );
            } );

            it( "because Fruit prototype is in [[Prototype]].[[Prototype]].. chain of apple", function(){
                var apple = new Apple();
                expect( Fruit.prototype.isPrototypeOf( apple ) ).to.be.ok();
            } );
        } );

        describe("isProtoTypeOf test (X in x.[[Prototype]].[[Prototype]].. chain)", function(){

            beforeEach( function(){
                Util.inheritPrototype( Apple, Fruit );
            } );

            it( "Apple.prototype prototypeOf apple ", function(){
                var apple = new Apple();
                expect( Apple.prototype.isPrototypeOf( apple ) ).to.be.ok();
            } );

            it( "Fruit.prototype prototypeOf apple ", function(){
                var apple = new Apple();
                expect( Fruit.prototype.isPrototypeOf( apple ) ).to.be.ok();
            } );
        } );

        describe("inherits only prototype properties", function(){

            it( "inherits existing parent prototype properties", function(){
                Fruit.prototype[NEW_PROPERTY] = NEW_PROPERTY;
                Util.inheritPrototype( Apple, Fruit );
                var apple = new Apple();
                expect( NEW_PROPERTY in apple ).to.be( true );
            } );

            it( "inherits new parent prototype properties", function(){
                Util.inheritPrototype( Apple, Fruit );
                var apple = new Apple();
                Fruit.prototype[NEW_PROPERTY] = NEW_PROPERTY;
                expect( NEW_PROPERTY in apple ).to.be( true );
            } );

            it( "but does not inherit existing parent properties", function(){
                Util.inheritPrototype( Apple, Fruit );
                var apple = new Apple();
                expect( METHOD in apple ).to.be( false );
                expect( PROPERTY in apple ).to.be( false );
            } );
            // hence recommended behaviour to put reusable behaviour in prototype
        });

        describe("inherits own properties if explicitly told to", function(){

            beforeEach( function(){
                Util.inheritPrototype( Apple, Fruit, 'includeOwnProperties' );
            } );

            it( "inherits existing parent properties", function(){
                var apple = new Apple();
                expect( METHOD in apple ).to.be( true );
                expect( PROPERTY in apple ).to.be( true );
            } );

            it( "inherited existing parent values", function(){
                var apple = new Apple();
                expect( apple[METHOD] ).to.eql( Fruit[METHOD] );
                expect( apple[PROPERTY] ).to.eql( Fruit[PROPERTY] );
            } );

            it( "does not inherit later parent properties", function(){
                var apple = new Apple();
                Fruit[NEW_PROPERTY] = NEW_PROPERTY;
                expect( NEW_PROPERTY in apple ).to.be( false );
            } );

            it( "but does inherit later parent prototype properties", function(){
                var apple = new Apple();
                Fruit.prototype[NEW_PROPERTY] = NEW_PROPERTY;
                expect( NEW_PROPERTY in apple ).to.be( true );
            } );
            // hence recommended behaviour to put reusable behaviour in prototype
        });
    } );
});





