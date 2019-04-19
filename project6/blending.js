/*
 *  Author: Brett Heithold
 *  File:   blending.js
 *  Description:
 *          CS435, Project #6
 */

var canvas;
var gl;

var numVertices = 36;
var program;
var modelViewMatrix = rotate(0, -1, 0, 0);
modelViewMatrix = mult(rotate(0, 0, 1, 0), modelViewMatrix);
var pointsArray = [];
var colors = [];
var textureCoordinates = [];
var images = [];

var moveX = 0.0;
var moveY = 0.0;
var wallpaper;
var carpetImage;
var texCoord = [
  vec2(0, 0),
  vec2(0, 1),
  vec2(1, 1),
  vec2(1, 0)
];

var vertices = [
  vec4(-0.5, -0.5, 0.1, 1.0),
  vec4(-0.5, 0.5, 0.1, 1.0),
  vec4(0.5, 0.5, 0.1, 1.0),
  vec4(0.5, -0.5, 0.1, 1.0),
  vec4(-0.5, -0.5, -0.1, 1.0),
  vec4(-0.5, 0.5, -0.1, 1.0),
  vec4(0.5, 0.5, -0.1, 1.0),
  vec4(0.5, -0.5, -0.1, 1.0)
];

var vertexColors = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0),  // white
  vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [180, 0.0, 0.0];

var thetaLoc;

function configureTexture(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function configureTextureRGBA(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function quad(a, b, c, d) {
  pointsArray.push(vertices[a]);
  colors.push(vertexColors[6]);
  textureCoordinates.push(texCoord[0]);

  pointsArray.push(vertices[b]);
  colors.push(vertexColors[6]);
  textureCoordinates.push(texCoord[1]);

  pointsArray.push(vertices[c]);
  colors.push(vertexColors[6]);
  textureCoordinates.push(texCoord[2]);

  pointsArray.push(vertices[a]);
  colors.push(vertexColors[6]);
  textureCoordinates.push(texCoord[0]);

  pointsArray.push(vertices[c]);
  colors.push(vertexColors[6]);
  textureCoordinates.push(texCoord[2]);

  pointsArray.push(vertices[d]);
  colors.push(vertexColors[6]);
  textureCoordinates.push(texCoord[3]);
}

function colorCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  colorCube();
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var vertexTextureCoordinate = gl.getAttribLocation(program, "vertexTextureCoordinate");
  gl.vertexAttribPointer(vertexTextureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexTextureCoordinate);

  //
  // Initialize a textures
  //

  images[0] = document.getElementById("wallpaper");
  images[1] = document.getElementById("carpet");
  images[2] = document.getElementById("backyard");
  images[3] = document.getElementById("windowWall");
  wallpaper = configureTexture(images[0]);
  carpetImage = configureTexture(images[1]);
  backyardImage = configureTexture(images[2]);
  windowWall = configureTextureRGBA(images[3]);

  // Key Listeners
  document.addEventListener("keyup", function () {
    if (event.keyCode == 37) {
      moveX -= 0.025;
      render();
    }
    else if (event.keyCode == 38) {
      moveY += 0.025;
      render();
    }
    else if (event.keyCode == 40) {
      moveY -= 0.025;
      render();
    }
    else if (event.keyCode == 39) {
      moveX += 0.025;
      render();
    }
  })

  render();

}

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  leftWall();
  rightWall();
  backyard();
  backWall();
  carpet();
  requestAnimFrame(render);
}

function leftWall() {
  var s = scalem(1, 1, 1);
  var instanceMatrix = mult(translate(-0.8, 0.0, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(-270, 0, 1, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, wallpaper);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function rightWall() {
  var s = scalem(1, 1, 1);
  var instanceMatrix = mult(translate(0.8, 0.0, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(-270, 0, 1, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function backWall() {
  var s = scalem(1.8, 1, 1);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.4), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, windowWall);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function backyard() {
  var s = scalem(2, 2, 2);
  var instanceMatrix = mult(translate(moveX, moveY, 0.8), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, backyardImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function carpet() {
  var s = scalem(1.8, 1, 1);
  var instanceMatrix = mult(translate(0.0, -0.6, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, carpetImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}
