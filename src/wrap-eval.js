var fs = require( 'fs' );
var path = require( 'path' );
var UglifyJS = require( 'uglify-js' );
var dataRoot = path.resolve( __dirname, '..', 'data' );
var codeFile = path.resolve( dataRoot, 'code-with-eval.js' );
// var codeFile = path.resolve( dataRoot, 'voice-baidu.js' );
var codeFileTry = path.resolve( dataRoot, 'try-catch.js' );

var deep_clone = new UglifyJS.TreeTransformer( function( node, descend ) {
        node = node.clone();
        descend( node, this );
        return node;
    });

var code = fs.readFileSync( codeFile, 'utf8' ); 
var codeTry = fs.readFileSync( codeFileTry, 'utf8' ); 

var ast = UglifyJS.parse( code, { filename: codeFile } );
var astTry = UglifyJS.parse( codeTry );

// console.log( JSON.stringify( ast ) );
// ast.figure_out_scope();

var wrap_eval = new UglifyJS.TreeTransformer( function( node, descend ) {
        // console.log( node.start.file, node.start.type );
        if ( node instanceof UglifyJS.AST_Call && node.expression.name == 'eval' ) {
            // console.log( '==============================' );
            // console.log( node );
            var nodeTry = astTry.transform( deep_clone );
            nodeTry.body[ 0 ].body.unshift( node );
            descend( node, this ); 
            return nodeTry;
        }

        if ( node instanceof UglifyJS.AST_Defun 
            || node instanceof UglifyJS.AST_Function ) {
            descend( node, this ); 
            var nodeTry = astTry.transform( deep_clone );
            var oldBody = node.body;
            node.body = [ nodeTry ];
            nodeTry.body[ 0 ].body = nodeTry.body[ 0 ].body.concat( oldBody );
            return node;
        }
    } );

ast = ast.transform( wrap_eval );
// console.log( astTry.body[ 0 ].bcatch.body[ 0 ].value.expression );
// console.log( astTry );
// return;

var stream = UglifyJS.OutputStream( {
        space_colon: true
        , width: 8
        , beautify: true
        , max_line_len: 100
    } );
ast.print( stream );
var outputCode = stream.toString();

console.log( stream.toString() );

