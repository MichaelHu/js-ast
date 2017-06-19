var UglifyJS = require( 'uglify-js' );
var ast = UglifyJS.parse( "a = 1 + 2" );
var deep_clone = new UglifyJS.TreeTransformer( function( node, descend ) {
        node = node.clone();
        // the descend function expects two arguments:
        // the node to dive into, and the tree walker
        // `this` here is the tree walker (=== deep_clone).
        // by descending into the *cloned* node, we keep the original intact
        descend( node, this );
        return node;
    });

var ast2 = ast.transform( deep_clone );
ast.body[ 0 ].body.left.name = "CHANGED";

console.log( ast.print_to_string( { beautify: true } ) );
console.log( ast2.print_to_string( { beautify: true } ) );
