/*
 *  File:   spotlight.js
 *  Author: Brett Heithold
 */

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var minX = -1.0;
var maxX = 1.0;
var minY = -1.0;
var maxY = 1.0;

var vertices = [
        vec4(-1.0, -1.0,  0.25, 1.0),
        vec4(-1.0,  1.0,  0.25, 1.0),
        vec4( 1.0,  1.0,  0.25, 1.0),
        vec4( 1.0, -1.5,  0.25, 1.0),
        vec4(-1.0, -0.5, -0.25, 1.0),
        vec4(-1.0,  0.0, -0.25, 1.0),
        vec4( 0.0,  0.0, -0.25, 1.0),
        vec4( 0.0, -0.5, -0.25, 1.0)
    ];

var lightSource = [0.0, 0.0];

var lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(0.5, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.5, 1.5, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShine = 100.0;

var modelView, projection;
var viewerPos;
var program;

var xAxis = 1;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

// Stage Section
function stageSection(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}

// Stage
function stage()
{
    stageSection(1, 0, 3, 2);
    stageSection(2, 3, 7, 6);
    stageSection(3, 0, 4, 7);
    stageSection(6, 5, 1, 2);
    stageSection(4, 5, 6, 7);
    stageSection(5, 4, 0, 1);
}

// Event-Listener for arrow keys
window.onkeydown = function(e) {
	   var key = e.keyCode ? e.keyCode : e.which;
	   if(key == 38){ //up arrow
           lightSource[1] = clampY(lightSource[1] - 0.05);
           updatedLightRendering();
	   }
	   if(key == 40){ //down arrow
           lightSource[1] = clampY(lightSource[1] + 0.05);
           updatedLightRendering();
	   }
	   if(key == 37){ //left arrow
           lightSource[0] = clampX(lightSource[0] + 0.05);
           updatedLightRendering();
	   }
	   if(key == 39){ //right arrow
           lightSource[0] = clampX(lightSource[0] - 0.05);
           updatedLightRendering();
	   }
	}

// Clamps the x value between minX and maxX
function clampX(newX) {
    if (newX > maxX) return maxX;
    else if (newX < minX) return minX;
    else return newX;
}

// Clamps the y value between minY and maxY
function clampY(newY) {
    if (newY > maxY) return maxY;
    else if (newY < minY) return minY;
    else return newY;
}

// Updates the spotlight
function updatedLightRendering(){
    lightPosition = vec4(lightSource[0], lightSource[1], 0.0, 0.0);
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
}

// Corrects slider value
function correctSliderValue(value) {
    return 100 - value + 1;
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    // Slider
    document.getElementById("slider").oninput = function() {
        var newSliderValue = this.value;
        materialShine = correctSliderValue(newSliderValue);
        gl.uniform1f(gl.getUniformLocation(program, "shine"),materialShine);
    };

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

    stage();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0);

    projection = ortho(-1, 1, -1, 1, -100, 100);
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shine"),materialShine);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));
    render();
}

var render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0]));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0]));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1]));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelView));

    // Draw Stage
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame(render);
}
