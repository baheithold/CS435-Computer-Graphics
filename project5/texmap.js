

var canvas;
var gl;

var numVertices  = 36;

var program;

var tvON = false; // this flag holds the on/off state for the TV
var isPaused = false;
var images = [];
var tvFrames = [];
var currentFrameIndex = 0;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

function configureTexture( image ) {
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    return texture;
}


function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[2]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[2]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[2]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[2]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[2]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[2]);
     texCoordsArray.push(texCoord[3]);
}


function TV()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    currentFrameIndex = 0;
    isPaused = true;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // create TV, table, walls, and floor
    TV();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    //
    // Initialize a images
    //

    // TV frames
    images[0] = document.getElementById("img_offscreen");
    tvFrames[0] = configureTexture(images[0]);
    images[1] = document.getElementById("img_a1");
    tvFrames[1] = configureTexture(images[1]);
    images[2] = document.getElementById("img_a2");
    tvFrames[2] = configureTexture(images[2]);
    images[3] = document.getElementById("img_noIdea");
    tvFrames[3] = configureTexture(images[3]);

    // Room textures
    wallImage = document.getElementById("img_wallpaper");
    wallTexture = configureTexture(wallImage);
    carpetImage = document.getElementById("img_carpet");
    carpetTexture = configureTexture(carpetImage);
    woodImage = document.getElementById("img_wood");
    woodTexture = configureTexture(woodImage);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    //
    // Button Event Handlers
    //

    // prev button
    document.getElementById("btnPrev").onclick = function() {
        console.log("Prev");
        if (isPaused) {
            clampFrameIndex(--currentFrameIndex);
            render();
        }
    };

    // next button
    document.getElementById("btnNext").onclick = function() {
        console.log("Next, Frame: " + currentFrameIndex);
        if (isPaused) {
            clampFrameIndex(++currentFrameIndex);
            render();
        }
    };

    // on/off button
    document.getElementById("btnONOFF").onclick = function() {
        tvON = !tvON;
        if (tvON) {
            currentFrameIndex = 0;
        }
        isPaused = false;
        console.log("TV " + (tvON ? "ON" : "OFF"));
    };

    // pause button
    document.getElementById("btnPAUSE").onclick = function() {
        isPaused = !isPaused;
        console.log("PAUSED: " + isPaused);
    };

    render(currentFrameIndex);
    setInterval(function() {
        console.log(currentFrameIndex);
        if (isPaused) render();
        else {
            if (tvON) clampFrameIndex();
            ++currentFrameIndex;
            requestAnimFrame(render);
        }
    }, 1500);
}


var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (tvON) clampFrameIndex();
    renderTVframe(currentFrameIndex);
    renderTable();
    renderWalls();
    renderFloor();
}

var renderTVframe = function(){
    if (tvON) clampFrameIndex();
    gl.bindTexture(gl.TEXTURE_2D, tvFrames[currentFrameIndex]);
    gl.drawArrays(gl.TRIANGLES, numVertices/2, numVertices/2);
}

function renderTable() {
    // renderTop();
    // renderLeftLeg();
    // renderRightLeg();
}

function renderWalls() {
    // renderLeftWall();
    // renderRightWall();
}

function renderLeftWall() {
}

function renderFloor() {
}

function clampFrameIndex() {
    if (currentFrameIndex > tvFrames.length - 1) currentFrameIndex = 1;
    else if (currentFrameIndex < 1) currentFrameIndex = tvFrames.length - 1;
}
