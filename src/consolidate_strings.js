var UglifyJS = require( 'uglify-js' );
// in this hash we will map string to a variable name
var strings = {};

// here's the transformer:
var consolidate = new UglifyJS.TreeTransformer( null, function( node ) {
    if ( node instanceof UglifyJS.AST_Toplevel ) {
        // since we get here after the toplevel node was processed,
        // that means at the end, we'll just create the var definition,
        // or better yet, "const", and insert it as the first statement.
        var defs = new UglifyJS.AST_Const( {
            definitions: Object.keys(strings).map(function(key){
                var x = strings[ key ];
                return new UglifyJS.AST_VarDef( {
                    name  : new UglifyJS.AST_SymbolConst( { name: x.name } ),
                    value : x.node, // the original AST_String
                } );
            })
        });
        node.body.unshift( defs );
        return node;
    }
    if ( node instanceof UglifyJS.AST_String ) {
        // when we encounter a string, we give it an unique
        // variable name (see the getStringName function below)
        // and return a symbol reference instead.
        return new UglifyJS.AST_SymbolRef( {
            start : node.start,
            end   : node.end,
            name  : getStringName(node).name,
        } );
    }
} );

var count = 0;
function getStringName( node ) {
    var str = node.getValue(); // node is AST_String
    if ( strings.hasOwnProperty( str ) ) return strings[ str ];
    var name = "_" + ( ++count );
    return strings[ str ] = { name: name, node: node };
}

// now let's try it.
var ast = UglifyJS.parse( function foo() {
    console.log( "This is a string" );
    console.log( "Another string" );
    console.log( "Now repeat" );
    var x = "This is a string", y = "Another string";
    var x = x + y + "Now repeat";
    alert( "Now repeat".length );
    alert( "Another string".length );
    alert( "This is a string".length );
}.toString() );

// transform and print
var ast2 = ast.transform( consolidate );
console.log( ast2.print_to_string( { beautify: true } ) );

// also, the change is non-destructive; the original AST remains the same:
console.log( "Original ( after v2.6.2 the original ast is changed):" );
console.log( ast.print_to_string( { beautify: true } ) ); 
