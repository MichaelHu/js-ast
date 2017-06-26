var fs = require( 'fs' );
var path = require( 'path' );
var UglifyJS = require( 'uglify-js' );
var dataRoot = path.resolve( __dirname, '..', 'data' );
var codeFile = path.resolve( dataRoot, 'code-with-eval.js' );
// var codeFile = path.resolve( dataRoot, 'voice-baidu.js' );
var codeFileTry = path.resolve( dataRoot, 'try-catch.js' );

//             var ast = UglifyJS.parse( 
//                     // '( function() { try {} catch( e ) { throw Error(e); } } )()' 
//                     'try {} catch( e ) { throw Error(e); }' 
//                 ); 
// 
// console.log( JSON.stringify( ast ) );
// return;

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
ast.figure_out_scope();

function getNodeDesc( node, maxlen ) {
    if ( 'string' == typeof node || 'number' == typeof node ) {
        return node;
    }

    var _stream = UglifyJS.OutputStream( {
            beautify: true
        } );
    node.print( _stream );
    var _outputCode = _stream.toString();
    return _outputCode.substr( 0, maxlen );
}

var wrap_eval = new UglifyJS.TreeTransformer( function( node, descend ) {
        var needCatch = this.has_directive( 'use catch' );
        // console.log( node.start.file, node.start.type );
        if ( node instanceof UglifyJS.AST_Call 
            && node.expression.name == 'eval' 
            && needCatch ) {
            var parentNode = this.parent( 1 );
            console.log( 'eval ======');
            if ( 
                parentNode instanceof UglifyJS.AST_Toplevel
                || ( parentNode instanceof UglifyJS.AST_Defun
                    || parentNode instanceof UglifyJS.AST_Function 
                ) ) {
                console.log( 'below function eval' );
            // console.log( parentNode ); 
            // var nodeTry = astTry.transform( deep_clone );
            var nodeTry = UglifyJS.parse( 
                    'try {} catch( e ) { throw Error(e); }' 
                    // '( function() { try {} catch( e ) { throw Error(e); } } )()' 
                    // '( ( function() { try {} catch( e ) { throw Error(e); } } )() || 0 )' 
                ); 
            // var _node = new UglifyJS.AST_Block();
            // _node.body.push( new UglifyJS.AST_Function() );
            // _node.body[ 0 ].body.expression.push( new UglifyJS.AST_Try() );
            // _node.body[ 0 ].body.expression.body[ 0 ].bcatch = new UglifyJS.AST_Catch();
            // _node.body[ 0 ].body.expression.body[ 0 ].bcatch.argname = 'e';
            // _node.body[ 0 ].body.expression.body[ 0 ].bcatch.body.push( new UglifyJS.AST_Throw() );
            // _node.body[ 0 ].body.expression.body[ 0 ].bcatch.body[ 0 ].value
            //     =  new UglifyJS.AST_Call() ;
            // _node.body[ 0 ].body.expression.body[ 0 ].bcatch.body[ 0 ].value.args.push( 
                //
            nodeTry.body[ 0 ].body.unshift( node );
            // nodeTry.body[ 0 ].body.expression.body[ 0 ].body.unshift( node );
            // _node.body[ 0 ].body.expression.body[ 0 ].body.unshift( node );

            // nodeTry.body[ 0 ].body.left.expression.body[ 0 ].body.unshift( node );
            descend( node, this ); 
            return nodeTry;
            // return _node;
            }
        }

        if ( 
            ( node instanceof UglifyJS.AST_Defun 
                || node instanceof UglifyJS.AST_Function 
            )
            && needCatch ) {

            var funcName = node.name && node.name.name;
            if ( funcName ) {
                console.log( 'name: ' + funcName );
            }
            else {
                // var parentNode = this.find_parent( UglifyJS.AST_Assign );
                var parentNode = this.parent();

                if ( parentNode instanceof UglifyJS.AST_Assign ) {
                    // funcName = parentNode.left.end.value;
                    funcName = getNodeDesc( parentNode.left, 50 );
                    console.log( '==== assign: ' + funcName + ' ====' );
                }
                else if ( parentNode instanceof UglifyJS.AST_VarDef ) {
                    // funcName = parentNode.name.end.value;
                    funcName = getNodeDesc( parentNode.name, 50 );
                    console.log( '==== var: ' + funcName + ' ====' );
                }
                else if ( parentNode instanceof UglifyJS.AST_ObjectProperty ) {
                    // funcName = parentNode.key;
                    funcName = getNodeDesc( parentNode.key, 50 );
                    console.log( '==== property: ' + funcName + ' ====' );
                }
                else {
                    funcName = getNodeDesc( node, 50 );
                    console.log( '==== other: ' + funcName  + ' ====' );
                }
            }
            descend( node, this ); 
            if ( node.body.length == 1 
                && node.body[ 0 ].body
                && node.body[ 0 ].body.start.value == 'try' ) {
                return node;
            }
            // var nodeTry = astTry.transform( deep_clone );
            var nodeTry = UglifyJS.parse( 
                    'try{}catch( e ) { e.message += "\\n[ func error: ' 
                        + funcName.replace(/["\\]/g, '\\$&')
                            .replace( /[\r?\n]/g, ' ')
                            .replace( /\s{2,}/g, '' ) 
                        + ' ... ]"; throw Error( e ); }' 
                );
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

