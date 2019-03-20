/*
 *  Author: Brett Heithold
 *  File:   buildingBlocks.js
 *  Description:
 *  CS435 - Computer Graphics, Project #2
 */

"use strict"

var canvas;
var gl;

var projection; // projection matrix uniform shader variable location
var transformation; // projection matrix uniform shader variable location
var vPosition;
var vColor;

// state representation
var Blocks; // Blocks
var BlockIdToBeMoved; // this block is moving
var MoveCount;
var OldX;
var OldY;
var cPieceIndex = -1;

var colors = [
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(1.0, 0.0, 1.0, 1.0),
    vec4(0.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
];

function CPiece (n, color, x0, y0, x1, y1, x2, y2, x3, y3) {
    this.color = color;
    this.points = [];
    this.colors = [];
    if (cPieceIndex < 3) {
        this.NumVertices = 50;
        for (var i = 0; i < this.NumVertices; i++) {
            var x = 50 * Math.cos((i / this.NumVertices) * 2.0 * Math.PI) + x0;
            var y = 50 * Math.sin((i / this.NumVertices) * 2.0 * Math.PI) + y0;
            this.points.push(vec2(x, y));
        }
        for (var i = 0; i < this.NumVertices; i++) {
            this.colors.push(color);
        }
    }
    else {
        this.NumVertices = n + 1;
        this.points.push(vec2(x0, y0));
        this.points.push(vec2(x1, y1));
        this.points.push(vec2(x2, y2));
        this.points.push(vec2(x3, y3));
        this.points.push(vec2(x1, y1));
        for (var i=0; i<5; i++) this.colors.push(color);
    }

    this.vBuffer=0;
    this.cBuffer=0;

    this.OffsetX=0;
    this.OffsetY=0;
    this.Angle=0;

    this.UpdateOffset = function(dx, dy) {
        this.OffsetX += dx;
        this.OffsetY += dy;
    }

    this.transform = function(x, y) {
        var theta = -Math.PI/180*this.Angle;	// in radians
        var x2 = this.points[0][0] + (x - this.points[0][0]-this.OffsetX) * Math.cos(theta) - (y - this.points[0][1]-this.OffsetY) * Math.sin(theta);
        var y2 = this.points[0][1] + (x - this.points[0][0]-this.OffsetX) * Math.sin(theta) + (y - this.points[0][1]-this.OffsetY) * Math.cos(theta);
        return vec2(x2, y2);
    }

    this.isInside = function(x, y) {
        var p=this.transform(x, y);
        for (var i=0; i<this.NumVertices; i++) {
            if (!this.isLeft(p[0], p[1], i)) return false;
        }
        return true;
    }

    this.init = function() {
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );

        this.cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );
    }

    this.draw = function() {
        var tm=translate(this.points[0][0]+this.OffsetX, this.points[0][1]+this.OffsetY, 0.0);
        tm=mult(tm, rotate(this.Angle, vec3(0, 0, 1)));
        tm=mult(tm, translate(-this.points[0][0], -this.points[0][1], 0.0));
        gl.uniformMatrix4fv( transformation, gl.TRUE, flatten(tm) );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        gl.drawArrays( gl.TRIANGLE_FAN, 0, this.NumVertices );
    }
}

window.onload = function initialize() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    document.addEventListener('keyup', function(event) {
        cPieceIndex = -1;
    });

    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 49) cPieceIndex = 0;
        else if (event.keyCode == 50) cPieceIndex = 1;
        else if (event.keyCode == 51) cPieceIndex = 2;
        else if (event.keyCode == 52) cPieceIndex = 3;
        else if (event.keyCode == 53) cPieceIndex = 4;
        else if (event.keyCode == 54) cPieceIndex = 5;
    });

  canvas.addEventListener("mousedown", function(event){
    if (event.button!=0) return; // left button only
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    y=canvas.height-y;
    if (cPieceIndex >= 0) {
        var transform1 = vec2(x-50, y-50);
        var transform2 = vec2(x+50, y+50);
        var transform3 = vec2(transform1[0], transform2[1]);
        var transform4 = vec2(transform2[0], transform1[1]);
        if (cPieceIndex < 3) {
            Blocks.push(new CPiece(4, colors[cPieceIndex],
                x, y,
                transform2[0], transform2[1],
                transform3[0], transform3[1],
                transform4[0], transform4[1]));
        }
        else {
            Blocks.push(new CPiece(4, colors[cPieceIndex],
                transform1[0], transform1[1],
                transform2[0], transform2[1],
                transform3[0], transform3[1],
                transform4[0], transform4[1]));
        }
        Blocks[Blocks.length-1].init();
        window.requestAnimFrame(render);
    }
    // console.log("mousedown, x="+x+", y="+y);
    if (event.shiftKey) {  // with shift key, rotate counter-clockwise
      for (var i=Blocks.length-1; i>=0; i--) {	// search from last to first
        if (Blocks[i].isInside(x, y)) {
          // move Blocks[i] to the top
          var temp=Blocks[i];
          for (var j=i; j<Blocks.length-1; j++) Blocks[j]=Blocks[j+1];
          Blocks[Blocks.length-1]=temp;
          // Delete Block
          Blocks.pop();
          // redraw
          window.requestAnimFrame(render);
          return;
        }
      }
      return;
    }
    for (var i=Blocks.length-1; i>=0; i--) {	// search from last to first
      if (Blocks[i].isInside(x, y)) {
        // move Blocks[i] to the top
        var temp=Blocks[i];
        for (var j=i; j<Blocks.length-1; j++) Blocks[j]=Blocks[j+1];
        Blocks[Blocks.length-1]=temp;
        // remember the one to be moved
        BlockIdToBeMoved = Blocks.length-1;
        MoveCount=0;
        OldX=x;
        OldY=y;
        // redraw
        window.requestAnimFrame(render);
        break;
      }
    }
  });

  canvas.addEventListener("mouseup", function(event){
    if (BlockIdToBeMoved>=0) BlockIdToBeMoved=-1;
  });

  canvas.addEventListener("mousemove", function(event){
    if (BlockIdToBeMoved>=0) {  // if dragging
      var x = event.pageX - canvas.offsetLeft;
      var y = event.pageY - canvas.offsetTop;
      y=canvas.height-y;
      Blocks[BlockIdToBeMoved].UpdateOffset(x-OldX, y-OldY);
      MoveCount++;
      OldX=x;
      OldY=y;
      window.requestAnimFrame(render);
    }
  });

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Initial State
    Blocks=[];
    for (var i=0; i<Blocks.length; i++) {
        Blocks[i].init();
    }
    BlockIdToBeMoved=-1; // no piece selected

    projection = gl.getUniformLocation( program, "projection" );
    var pm = ortho( 0.0, canvas.width, 0.0, canvas.height, -1.0, 1.0 );
    gl.uniformMatrix4fv( projection, gl.TRUE, flatten(pm) );

    transformation = gl.getUniformLocation( program, "transformation" );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    vColor = gl.getAttribLocation( program, "vColor" );

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i=0; i<Blocks.length; i++) {
        Blocks[i].draw();
    }
}
