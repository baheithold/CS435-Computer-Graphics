/*
 * Author: Brett Heithold
 * Creates the Koch Snowflake for CS435 Project #1
 */

var canvas;
var gl;

var points = [];

var numIterations = 5;

var a = vec2(-0.5, -0.5);
var b = vec2(0, Math.sqrt(3) * 0.5 - 0.5);
var c = vec2(0.5, -0.5);

window.onload = function init()
{
    // Initialize and Configure WebGL
    initializeAndConfigureWebGL();

    // Create snowflake
    kochSnowflake(a, b, c, numIterations);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function initializeAndConfigureWebGL() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
}

function kochSnowflake(a, b, c, count) {
    createSegment(a, b, count);
    createSegment(b, c, count);
    createSegment(c, a, count);
}

function createSegment(a, b, count) {
    var ab1 = mix(a, b, 1/3);
    var ab2 = mix(b, a, 1/3);
    var c = createRotatedPoint(ab1, ab2);
    if (count === 0) {
        points.push(a, ab1);
        points.push(ab1, c);
        points.push(c, ab2);
        points.push(ab2, b);
    }
    else {
        count--;
        createSegment(a, ab1, count);
        createSegment(ab2, b, count);
        createSegment(ab1, c, count);
        createSegment(c, ab2, count);
    }
}

function createRotatedPoint(center, p) {
    var sine = Math.sin(Math.PI/3);
    var cosine = Math.cos(Math.PI/3);
    var x = (p[0] - center[0]) * cosine - (p[1] - center[1]) * sine + center[0];
    var y = (p[0] - center[0]) * sine + (p[1] - center[1]) * cosine + center[1];
    return vec2(x, y);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, points.length );
}

