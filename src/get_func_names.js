var UglifyJS = require( 'uglify-js' );
var code = "function foo() {\n\
        function x() {}\n\
        function y() {}\n\
    }\n\
    function bar() {}\
    ";
var toplevel = UglifyJS.parse( code );
var walker = new UglifyJS.TreeWalker( function( node ) {
    if ( node instanceof UglifyJS.AST_Defun ) {
        // string_template is a cute little function that UglifyJS uses for warnings
        console.log( 
            UglifyJS.string_template( 
                "Found function {name} at {line},{col}"
                , {
                    name: node.name.name,
                    line: node.start.line,
                    col: node.start.col
                }
            )
        );
    }
} );
toplevel.walk( walker ); 
