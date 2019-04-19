/*
 *  Author: Brett Heithold
 *  File:   proj7.js
 *  Description:
 *          CS435, Project #7
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
var vertWallImage;
var horizWallImage;
var dirtImage;
var appleImage;
var snakeImage;
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

// Game Variables
var debug;
var score;
var paused;
var direction;
var snake_head_pos_x;
var snake_head_pos_y;
var snake_tail_pos_x;
var snake_tail_pos_y;

function configureTexture(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function configureTextureRGBA(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
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

  images[0] = document.getElementById("brick");
  images[1] = document.getElementById("dirt");
  images[2] = document.getElementById("apple");
  images[3] = document.getElementById("snake");
  vertWallImage = configureTexture(images[0]);
  horizWallImage = configureTexture(images[0]);
  dirtImage = configureTexture(images[1]);
  appleImage = configureTextureRGBA(images[2]);
  snakeImage = configureTextureRGBA(images[3]);

  // Initialize Game Variables
  debug = true; // set true for debugging logs
  snake_head_pos_x = -0.8;
  snake_head_pos_y = 0.8;
  snake_tail_pos_x = -0.8;
  snake_tail_pos_y = 0.8;
  apple_pos_x = 0;
  apple_pos_y = 0;
  score = 0;
  paused = true;
  direction = 'right';

  // Key Listeners
  document.addEventListener("keyup", function () {
    if (event.keyCode == 38) {
        // Up Button
        direction = 'up';
        if (debug) console.log("Direction: " + direction);
    }
    else if (event.keyCode == 40) {
        // Down Button
        direction = 'down';
        if (debug) console.log("Direction: " + direction);
    }
    else if (event.keyCode == 37) {
        // Left Button
        direction = 'left';
        if (debug) console.log("Direction: " + direction);
    }
    else if (event.keyCode == 39) {
        // Right Button
        direction = 'right';
        if (debug) console.log("Direction: " + direction);
    }
    else if (event.keyCode == 32) {
        // Pause Button
        paused = !paused;
        if (debug) console.log(paused ? "Paused" : "Unpaused");
    }
    else if (event.keyCode == 13) {
        // Random position (used for debugging)
        if (debug) {
            var x = randomPos();
            var y = randomPos();
            console.log("Random X: " + x);
            console.log("Random Y: " + y);
            apple_pos_x = x;
            apple_pos_y = y;
            document.getElementById("score").innerHTML = ++score;
        }
    }
  })

  document.addEventListener("mousedown", function(event) {
      // Used for debugging
      if (debug) {
          var x = event.clientX;
          var y = event.clientY;
          console.log("Mouse X: " + x);
          console.log("Mouse Y: " + y);
      }
  });

  render();
  setInterval(function() {
      if (debug) {
          console.log("SCORE: " + score);
      }
      if (paused) render();
      else {
          switch(direction) {
              case 'up':
                  snake_head_pos_y += 0.1;
                  break;
              case 'down':
                  snake_head_pos_y -= 0.1;
                  break;
              case 'left':
                  snake_head_pos_x -= 0.1;
                  break;
              case 'right':
                  snake_head_pos_x += 0.1;
                  break;
          }
          if (debug) console.log("SNAKE: " + snake_head_pos_x + ", " + snake_head_pos_y);
          if (ateApple()) {
              updateScore();
          }
          requestAnimFrame(render);
      }
  }, 1500);

}

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  leftWall();
  rightWall();
  dirt();
  snake(snake_head_pos_x, snake_head_pos_y);
  apple(apple_pos_x, apple_pos_y);
  bottomWall();
  topWall();
  requestAnimFrame(render);
}

function leftWall() {
  var s = scalem(0.5, 2, 1);
  var instanceMatrix = mult(translate(-0.95, 0.0, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(-270, 0, 1, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, vertWallImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function rightWall() {
  var s = scalem(0.5, 2, 1);
  var instanceMatrix = mult(translate(0.95, 0.0, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(-270, 0, 1, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, vertWallImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function apple(xPos, yPos) {
  var s = scalem(0.1, 0.1, 1);
  var instanceMatrix = mult(translate(xPos, yPos, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(180, 1, 0, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, appleImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function snake(xPos, yPos) {
  var s = scalem(0.1, 0.1, 1);
  var instanceMatrix = mult(translate(xPos, yPos, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(180, 1, 0, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, snakeImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function dirt() {
  var s = scalem(2, 2, 2);
  var instanceMatrix = mult(translate(0, 0, 0.8), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, dirtImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function bottomWall() {
  var s = scalem(2.0, 0.5, 1);
  var instanceMatrix = mult(translate(0.0, -0.95, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, horizWallImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function topWall() {
  var s = scalem(2.0, 0.5, 1);
  var instanceMatrix = mult(translate(0.0, 0.95, 0.0), s);
  instanceMatrix = mult(instanceMatrix, rotate(90, 1, 0, 0));
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.bindTexture(gl.TEXTURE_2D, horizWallImage);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

function randomPos() {
    var min = -0.8;
    var max = 0.8;
    var pos = Math.random() * (max - min) + min;
    var result = pos.toFixed(1);
    return result;
}

function ateApple() {
    var xDiff = snake_head_pos_x - apple_pos_x;
    var yDiff = snake_head_pos_y - apple_pos_y;
    if (Math.abs(xDiff) < 0.00001 && Math.abs(yDiff) < 0.00001) {
        if (debug) console.log("MUNCH!");
        return true;
    }
    return false;
}

function updateScore() {
    score++;
    document.getElementById("score").innerHTML = score;
}
