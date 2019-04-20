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
var gameOver;
var score;
var paused;
var direction;
var maxX;
var minX;
var maxY;
var minY;
var snake_segments = [];
var snake_start_x;
var snake_start_y;
var snake_head_pos_x;
var snake_head_pos_y;

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
  gameOver = false;
  maxX = 0.8;
  minX = -0.8;
  maxY = 0.8;
  minY = -0.8;
  snake_start_x = minX;
  snake_start_y = maxY;
  snake_head_pos_x = snake_start_x;
  snake_head_pos_y = snake_start_y;
  snake_segments.push({x: snake_head_pos_x, y: snake_head_pos_y})
  apple_start_x = 0;
  apple_start_y = 0;
  apple_pos_x = apple_start_x;
  apple_pos_y = apple_start_y;
  score = 0;
  paused = true;
  direction = 'right';

  // Key Listeners
  document.addEventListener("keyup", function () {
    if (event.keyCode == 38 || event.keyCode == 87) {
        // Up Button or W key
        if (direction != 'down') direction = 'up';
    }
    else if (event.keyCode == 40 || event.keyCode == 83) {
        // Down Button or S key
        if (direction != 'up') direction = 'down';
    }
    else if (event.keyCode == 37 || event.keyCode == 65) {
        // Left Button or A key
        if (direction != 'right') direction = 'left';
    }
    else if (event.keyCode == 39 || event.keyCode == 68) {
        // Right Button or D key
        if (direction != 'left') direction = 'right';
    }
    else if (event.keyCode == 32) {
        // Pause Button
        paused = !paused;
        document.getElementById("game_status").innerHTML = paused ? "Paused" : "Slithering";
    }
    else if (event.keyCode == 13) {
        // Reset Button
        if (debug) console.log("RESET");
        paused = true;
        score = 0;
        snake_head_pos_x = snake_start_x;
        snake_head_pos_y = snake_start_y;
        snake_segments = [];
        snake_segments.push({x: snake_start_x, y: snake_start_y});
        apple_pos_x = apple_start_x;
        apple_pos_y = apple_start_y;
        direction = 'right';
        document.getElementById("game_status").innerHTML = "Paused";
        document.getElementById("score").innerHTML = score;
    }
  })

  render();
  setInterval(function() {
      if (paused) render(); // paused
      else {
          // unpaused
          switch(direction) {
              case 'up':
                  snake_head_pos_y += 0.1;
                  if (snake_head_pos_y > maxY) snake_head_pos_y = minY;
                  break;
              case 'down':
                  snake_head_pos_y -= 0.1;
                  if (snake_head_pos_y < minY) snake_head_pos_y = maxY;
                  break;
              case 'left':
                  snake_head_pos_x -= 0.1;
                  if (snake_head_pos_x < minX) snake_head_pos_x = maxX;
                  break;
              case 'right':
                  snake_head_pos_x += 0.1;
                  if (snake_head_pos_x > maxX) snake_head_pos_x = minX;
                  break;
          }
          snake_segments[0].x = snake_head_pos_x;
          snake_segments[0].y = snake_head_pos_y;
          if (debug) console.log("SNAKE: " + snake_head_pos_x + ", " + snake_head_pos_y);
          if (didEatApple()) {
              // snake ate apple
              updateScore();
              extendSnake();
              moveApple();
          }
          if (gameOver) {
              // Game Over
              document.getElementById("game_status").innerHTML = "Game Over";
              if (debug) console.log("Game Over!");
              paused = true;
          }
          requestAnimFrame(render);
      }
  }, 500);

}

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  leftWall();
  rightWall();
  dirt();
  snake();
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

function snake() {
  for (var i = 0; i < snake_segments.length; i++) {
      var s = scalem(0.1, 0.1, 1);
      var xPos = snake_segments[i].x;
      var yPos = snake_segments[i].y;
      var instanceMatrix = mult(translate(xPos, yPos, 0.0), s);
      instanceMatrix = mult(instanceMatrix, rotate(180, 1, 0, 0));
      var t = mult(modelViewMatrix, instanceMatrix);
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
      gl.bindTexture(gl.TEXTURE_2D, snakeImage);
      gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  }
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

function didEatApple() {
    var xDiff = snake_head_pos_x - apple_pos_x;
    var yDiff = snake_head_pos_y - apple_pos_y;
    if (Math.abs(xDiff) < 0.00001 && Math.abs(yDiff) < 0.00001) {
        if (debug) console.log("MUNCH!");
        return true;
    }
    return false;
}

function moveApple() {
    var newX = randomPos();
    var newY = randomPos();
    apple_pos_x = newX;
    apple_pos_y = newY;
}

function moveSnake() {
}

function extendSnake() {
    var tail = snake_segments[snake_segments.length - 1];
    var newX;
    var newY;
    switch(direction) {
        case 'up':
            newX = tail.x;
            newY = tail.y - 0.1;
            break;
        case 'down':
            newX = tail.x;
            newY = tail.y + 0.1;
            break;
        case 'left':
            newX = tail.x + 0.1;
            newY = tail.y;
            break;
        case 'right':
            newX = tail.x - 0.1;
            newY = tail.y;
            break;
    }
    snake_segments.push({x: newX, y: newY})
}

function updateScore() {
    score++;
    document.getElementById("score").innerHTML = score;
}
