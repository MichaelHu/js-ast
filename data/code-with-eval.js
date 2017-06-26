// comments
'use catch';
eval( 'var g = 123; console.log( g ); ' );
( function() {
    eval( 'var a = 345; console.log( 1/a );' );

    var aa = eval( '12345;' ) || 1; 

    function abc() {
        console.log( 'abc' );
    }

    function Person( name ) {
        this.name = name;
    }

    Person.prototype.sayHello = function() {
        console.log( 'Hello' );
    };

    function outer() {
        return _.every( function( o ) { return 'string' == typeof o; } );
    }

    var a = function() {
        console.log( 'a' );
    };

    var obj = {
            a: 123
            , b: function() {
                console.log( b );
            }
            , c: eval( '12345' )
        };

    const key = Symbol( 123 );

    obj[ key ] = function() {
        console.log( 123 );
    };

    var c = 1 == 0 ? 0 : function() { console.log( 'c' ); };

    abc();
} )();

var m = function() {
    console.log( 'm' );
};

eval( 'var g = 123; console.log( g ); ' );
