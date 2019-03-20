/*
 *  Author: Brett Heithold
 *  File:   modeling.js
 *  TODO: Implement Cylinders
 */

var NumVertices = 36; // (6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var segments = [];
var segmentColors = [];
var colors = [];

var word = "";
var paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit."
var wordIndex = 0;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

// RGBA colors
var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0)   // white
];

// Color Constants
var BLACK = 0;
var RED = 1;
var YELLOW = 2;
var GREEN = 3;
var BLUE = 4;
var MANGENTA = 5;
var CYAN = 6;
var WHITE = 7;


// Base, Cylinder, and Display Constants
var BASE_HEIGHT = 0.5;
var BASE_WIDTH = 6.0;
var CYL_HEIGHT = 2.0;
var CYL_WIDTH = 0.5;
var DISPLAY_HEIGHT = 6.0;
var DISPLAY_WIDTH = 12.0;

var letterDict = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25
}

// 16-Segment Display arrays for letters A-Z
var letterSegments = [
    [1,1,1,0,0,0,1,1,1,1,0,0,0,1,0,0], // A
    [1,1,0,1,0,0,1,0,1,1,1,0,0,0,1,1], // B
    [1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1], // C
    [1,1,0,1,0,0,1,0,0,1,1,0,0,0,1,1], // D
    [1,1,1,0,0,0,0,1,0,0,0,0,0,1,1,1], // E
    [1,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0], // F
    [1,1,1,0,0,0,0,0,1,1,0,0,0,1,1,1], // G
    [0,0,1,0,0,0,1,1,1,1,0,0,0,1,0,0], // H
    [1,1,0,1,0,0,0,0,0,0,1,0,0,0,1,1], // I
    [0,0,0,0,0,0,1,0,0,1,0,0,0,1,1,1], // J
    [0,0,1,0,0,1,0,1,0,0,0,1,0,1,0,0], // K
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1], // L
    [0,0,1,0,1,1,1,0,0,1,0,0,0,1,0,0], // M
    [0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,0], // N
    [1,1,1,0,0,0,1,0,0,1,0,0,0,1,1,1], // O
    [1,1,1,0,0,0,1,1,1,0,0,0,0,1,0,0], // P
    [1,1,1,0,0,0,1,0,0,1,0,1,0,1,1,1], // Q
    [1,1,1,0,0,0,1,1,1,0,0,1,0,1,0,0], // R
    [1,1,0,0,1,0,0,0,1,1,0,0,0,0,1,1], // S
    [1,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0], // T
    [0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,1], // U
    [0,0,1,0,0,1,0,0,0,0,0,0,1,1,0,0], // V
    [0,0,1,0,0,0,1,0,0,1,0,1,1,1,0,0], // W
    [0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0], // X
    [0,0,1,0,0,0,1,1,1,0,1,0,0,0,0,0], // Y
    [1,1,0,0,0,1,0,0,0,0,0,0,1,0,1,1]  // Z
]

// Shader transformation matrices
var modelViewMatrix;
var projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis
var BASE_INDEX = 0;
var CYL_INDEX = 1;
var DISPLAY_INDEX = 2;
var theta= [1, 0, 0];
var phi = 0;

var modelViewMatrixLoc;
var vBuffer;
var cBuffer;

//----------------------------------------------------------------------------

function quad (a, b, c, d) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube () {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


function letter (a, b, c, d) {
    segmentColors.push(vertexColors[BLACK]);
    segments.push(vertices[a]);
    segmentColors.push(vertexColors[BLACK]);
    segments.push(vertices[b]);
    segmentColors.push(vertexColors[BLACK]);
    segments.push(vertices[c]);
    segmentColors.push(vertexColors[BLACK]);
    segments.push(vertices[a]);
    segmentColors.push(vertexColors[BLACK]);
    segments.push(vertices[c]);
    segmentColors.push(vertexColors[BLACK]);
    segments.push(vertices[d]);
}



function colorLetter () {
    letter(1, 0, 3, 2);
    letter(2, 3, 7, 6);
    letter(3, 0, 4, 7);
    letter(6, 5, 1, 2);
    letter(4, 5, 6, 7);
    letter(5, 4, 0, 1);
}

//----------------------------------------------------

// Remmove when scale in MV.js supports scale matrices

function scale4 (a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

function isLetter (str) {
  return str.match(/[A-z]/i);
}

window.onload = function init () {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    colorCube();
    // Load shaders and use the resulting shader program
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and initialize buffer objects
    document.getElementById("btn-left").onclick = function() {theta[2] += 10;};
    document.getElementById("btn-right").onclick = function() {theta[2] -= 10;};
    document.getElementById("btn-up").onclick = function() {phi -= 10;};
    document.getElementById("btn-down").onclick = function() {phi += 10;};

    var cycleWords = window.setInterval (function () {
        word = "";
        if (wordIndex >= paragraph.length) wordIndex = 0;
        while (wordIndex < paragraph.length && paragraph[wordIndex] != ' ') {
        if (isLetter(paragraph[wordIndex]))
            word += paragraph[wordIndex];
            ++wordIndex;
        }
        ++wordIndex;
        word = word.toUpperCase();
        //console.log(word);
    }, 1000);


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    render();
}

//----------------------------------------------------------------------------

function base () {
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrix = rotate(theta[BASE_INDEX] * -15, -1, 1, 0);
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------


function display () {
    var s = scale4(DISPLAY_WIDTH, DISPLAY_HEIGHT, 0.2);
    var instanceMatrix = mult(translate(0.0, 0.5 * DISPLAY_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------


// TODO: Create Cylinder
function cyl ()
{
    var s = scale4(CYL_WIDTH, CYL_HEIGHT, 1);
    var instanceMatrix = mult(translate(0.0, 0.5 * CYL_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------

function displayWord (ch) {
    colorLetter();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(segments), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(segmentColors), gl.STATIC_DRAW);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var scale = scale4(0.2, 0.1, 1.5);
    var scale2 = scale4(0.45, 0.1, 0.5);
    var diagonalScale = scale4(0.35, 0.18, 0.35);
    var angle = 0;

    //
    // Check if segments are in-use and display them
    //

    // top horizontal left
    var instanceMatrix = mult(translate(-0.1, 0.2, 0.0), scale);
    var t = mult(modelViewMatrix, instanceMatrix);
    if (ch[0]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // top horizontal right
    instanceMatrix = mult(translate(0.15, 0.2, 0.0), scale);
    t = mult(modelViewMatrix, instanceMatrix);
    if(ch[1]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // top vertical left
    modelViewMatrix = mult(modelViewMatrix,rotate(90, 0, 0, 1));
    instanceMatrix = mult(translate(-0.1, 0.25, 0.0), scale2);
    t = mult(modelViewMatrix, instanceMatrix);
    if(ch[2]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // top vert mid
    instanceMatrix = mult(translate(-0.1, -0.05, 0.0), scale2);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[3]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // top left diagonal
    instanceMatrix = mult(translate(-0.1, 0.1, 0.0), diagonalScale);
    instanceMatrix = mult(instanceMatrix, rotate(-60, 0, 0, 1));
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[4]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // top right diagonal
    instanceMatrix = mult(translate(-0.1, -0.2, 0.0), diagonalScale);
    instanceMatrix = mult(instanceMatrix, rotate(60,0,0,1));
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[5]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // top vertical right
    instanceMatrix = mult(translate(-0.1, -0.35, 0.0), scale2);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[6]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // middle horizontal left
    instanceMatrix = mult(translate(0.1, 0.4, 0.0), scale);
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 0, 0, 1));
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[7]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // middle horizontal right
    instanceMatrix = mult(translate(-0.15, 0.4, 0.0), scale);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[8]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom vertical right
    modelViewMatrix = mult(modelViewMatrix,rotate(90, 0, 0, 1));
    instanceMatrix = mult(translate(0.7, 0.35, 0.0), scale2);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[9]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom middle vertical
    instanceMatrix = mult(translate(0.7, 0.05, 0.0), scale2);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[10]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom left diagonal
    instanceMatrix = mult(translate(0.7, 0.2, 0.0), diagonalScale);
    instanceMatrix = mult(instanceMatrix,rotate(30, 0, 0, 1));
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[11]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom right diagonal
    instanceMatrix = mult(translate(0.7, -0.1, 0.0), diagonalScale);
    instanceMatrix = mult(instanceMatrix, rotate(-30, 0, 0, 1));
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[12]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom left vertical
    instanceMatrix = mult(translate(0.7, -0.25, 0.0), scale2);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[13]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom left horizontal
    instanceMatrix = mult(translate(-0.1, -1.0, 0.0), scale);
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 0, 0, 1));
    t = mult(modelViewMatrix, instanceMatrix);
    if(ch[14]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
    // bottom right horizontal
    instanceMatrix = mult(translate(0.15, -1.0, 0.0), scale);
    t = mult(modelViewMatrix, instanceMatrix);
    if (ch[15]) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
}

var renderWord = function(word) {
    for (var i = 0; i < word.length; i++) {
        displayWord(letterSegments[letterDict[word[i]]]);
        modelViewMatrix = mult(modelViewMatrix, translate(1.0, 0.0, 0.0));
    }
}

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    modelViewMatrix = rotate(theta[BASE_INDEX], 0, 1, 0);
    base();
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[CYL_INDEX], 0, 0, 1));
    cyl();
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, CYL_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[DISPLAY_INDEX], 0, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(phi, 1, 0, 0));
    display();
    modelViewMatrix = mult(modelViewMatrix, translate(-5.5, CYL_HEIGHT + 1.5, 0.0));
    renderWord(word);
    requestAnimFrame(render);
}
