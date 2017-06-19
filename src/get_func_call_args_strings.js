var UglifyJS = require( 'uglify-js' );
var code = "function f(){}\n\
        var x = 'a string';\n\
        y = 'foo' + 'bar' + x;\n\
        f('a', 'b', (x + 'z'), y, 'c');\n\
    ";
var toplevel = UglifyJS.parse( code );
var walker = new UglifyJS.TreeWalker( function( node ) {
    if ( node instanceof UglifyJS.AST_String ) {
        var p = walker.parent();
        if ( p instanceof UglifyJS.AST_Call && node !== p.expression ) {
            console.log(
                "Found string: %s at %d,%d"
                , node.getValue()
                , node.start.line, node.start.col
            );
        }
    }
});
toplevel.walk( walker );
