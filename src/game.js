var graphics = require('./graphics');
var physics = require('./physics');
var Vector = require('./vector');
var Input = require('./input');

var testObject = {}
new physics.AABB( testObject, new Vector( 5,5 ), new Vector( 10,10 ) );
new physics.PhysObject( testObject );
new graphics.Sprite( testObject, "static/images/diver.png" );

var ctx = null,
    then = 0,
    input;
window.onload = function() {
  var canvas = document.createElement("canvas");
  ctx = canvas.getContext( "2d" );
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild( canvas );

  input = new Input( window );

  then = Date.now();
  //testObject.physics.force( new Vector( 100, 0 ) );

  main();
}

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

function main() {
  var now = Date.now();
  var dt = (now - then) / 1000;

  if( input.isKeyDown( 40 ) ) {
    testObject.physics.force( new Vector( 0, 1 ) );
  }

  if( input.isKeyDown( 38 ) ) {
    testObject.physics.force( new Vector( 0, -1 ) );
  }

  if( input.isKeyDown( 39 ) ) {
    testObject.physics.force( new Vector( 1, 0 ) );
  }

  if( input.isKeyDown( 37 ) ) {
    testObject.physics.force( new Vector( -1, 0 ) );
  }

  if( testObject.physics.velocity.magnitude_sq() > 45 * 45 ) {
    testObject.physics.velocity = testObject.physics.velocity.set_magnitude( 45 );
  }
  
  //testObject.aabb.move( new Vector( 1,0 ) );
  physics.physicsLoop( dt );
  graphics.drawLoop( ctx );

  then = now;

  requestAnimationFrame( main );
}
