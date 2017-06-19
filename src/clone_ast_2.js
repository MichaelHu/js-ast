var UglifyJS = require( 'uglify-js' );
var ast = UglifyJS.parse( "a = 1 + 2" );
var ast_2 = ast.transform( new UglifyJS.TreeTransformer( null, function() {} ) ); 

/**
 * < v2.6.2 false
 * >= v2.6.2 true
 */
console.log( ast == ast_2 );
